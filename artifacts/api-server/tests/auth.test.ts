import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import express from "express";
import cookieParser from "cookie-parser";
import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import reactionsRouter from "../src/routes/reactions";
import { ADMIN_SESSION_SECONDS, createAdminToken, verifyAdminToken } from "../src/lib/admin-session";
import { consumeAdminLoginAttempt, ADMIN_LOGIN_MAX_ATTEMPTS } from "../src/lib/admin-login-limit";

test("missing, empty, and whitespace signing secrets refuse module startup", () => {
  for (const secret of [undefined, "", " \t "]) {
    const env = { ...process.env };
    if (secret === undefined) delete env.SESSION_SECRET;
    else env.SESSION_SECRET = secret;
    const result = spawnSync(process.execPath, ["-e", `require(${JSON.stringify(process.env.AUTH_SESSION_TEST_MODULE)})`], {
      env, encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /SESSION_SECRET must be set/);
  }
});

test("session tokens reject the empty-key exploit, tampering, expiry, and malformed input", () => {
  const now = 1_800_000_000_000;
  const token = createAdminToken(now);
  assert.equal(verifyAdminToken(token, now), true);
  assert.equal(verifyAdminToken(token, now + ADMIN_SESSION_SECONDS * 1000), false);
  const expiry = token.split(".")[0];
  const forged = `${expiry}.${createHmac("sha256", "").update(expiry).digest("hex")}`;
  for (const invalid of [forged, `${Number(expiry) + 1}.${token.split(".")[1]}`, `${token}.extra`, "", null,
    `NaN.${token.split(".")[1]}`, `Infinity.${token.split(".")[1]}`]) {
    assert.equal(verifyAdminToken(invalid, now), false);
  }
});

test("PostgreSQL budget and HTTP authentication fail closed across instances", async () => {
  const schema = process.env.AUTH_TEST_SCHEMA!;
  assert.match(schema, /^auth_test_[a-f0-9]+$/);
  // Every connection in this test uses an isolated schema; real admin counters
  // and reaction data are never modified.
  assert.equal(process.env.PGOPTIONS, `-c search_path=${schema}`);
  await db.execute(sql.raw(`CREATE SCHEMA "${schema}"`));
  const existing = await db.execute(sql`SELECT to_regclass('public.admin_login_attempts') AS name`);
  const readRealBudget = async () => existing.rows[0].name
    ? (await db.execute(sql`SELECT scope, attempts, reset_at FROM public.admin_login_attempts ORDER BY scope`)).rows
    : [];
  const realBudgetBefore = await readRealBudget();
  const migration = await readFile("../../lib/db/migrations/20261003-admin-login-attempts.sql", "utf8");
  await db.execute(sql.raw(migration));
  const app = express();
  app.use(express.json(), cookieParser(), (req, _res, next) => {
    req.log = { error() {} } as typeof req.log;
    next();
  });
  app.use("/api", reactionsRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}/api`;
  const login = (password: string) => fetch(`${base}/reaction-admin/session`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  try {
    assert.equal((await fetch(`${base}/reaction-admin/stats`)).status, 401);
    const expiry = String(Math.floor(Date.now() / 1000) + 3600);
    const forged = `${expiry}.${createHmac("sha256", "").update(expiry).digest("hex")}`;
    assert.equal((await fetch(`${base}/reaction-admin/stats`, {
      headers: { Cookie: `jo_reaction_admin=${forged}` },
    })).status, 401);
    assert.equal((await login("wrong")).status, 401);
    const success = await login("synthetic-test-password");
    assert.equal(success.status, 200);
    const cookie = success.headers.get("set-cookie")!;
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Strict/i);
    assert.deepEqual(await (await fetch(`${base}/reaction-admin/session`, {
      headers: { Cookie: cookie.split(";")[0] },
    })).json(), { authenticated: true });
    assert.equal((await fetch(`${base}/reaction-admin/session`, { method: "DELETE" })).status, 200);
    for (let i = 2; i < ADMIN_LOGIN_MAX_ATTEMPTS; i++) {
      assert.equal((await login("wrong")).status, 401);
    }
    const blocked = await login("synthetic-test-password");
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
    assert.equal(blocked.headers.get("set-cookie"), null);
    // An independent process and pool still see the exhausted account budget.
    const probe = spawnSync(process.execPath, [process.env.AUTH_LIMIT_TEST_MODULE!], {
      env: { ...process.env }, encoding: "utf8",
    });
    assert.equal(probe.status, 0);
    assert.ok(Number(probe.stdout.trim()) > 0);
    const results = await Promise.all(Array.from({ length: 30 }, () => consumeAdminLoginAttempt("concurrent")));
    assert.equal(results.filter((retry) => retry === 0).length, ADMIN_LOGIN_MAX_ATTEMPTS);
    await db.execute(sql`UPDATE admin_login_attempts SET reset_at = statement_timestamp() - interval '1 second' WHERE scope = 'reaction-admin'`);
    assert.equal(await consumeAdminLoginAttempt(), 0);
    // Missing password is still unavailable, not an authentication bypass.
    delete process.env.REACTIONS_ADMIN_PASSWORD;
    assert.equal((await login("synthetic-test-password")).status, 503);
    process.env.REACTIONS_ADMIN_PASSWORD = "synthetic-test-password";
    await db.execute(sql`DROP TABLE admin_login_attempts`);
    const unavailable = await login("synthetic-test-password");
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.headers.get("set-cookie"), null);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    try {
      await db.execute(sql.raw(`DROP SCHEMA "${schema}" CASCADE`));
      assert.deepEqual(await readRealBudget(), realBudgetBefore, "Tests must not modify the real admin login budget");
    } finally {
      await pool.end();
    }
  }
});