import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { apiErrorHandler } from "../src/middlewares/api-errors.ts";

test("parser and unexpected errors return safe JSON in development and production", async () => {
  const app = express();
  app.use(express.json({ limit: "32kb" }));
  app.post("/login", (_req, res) => res.json({ ok: true }));
  app.get("/unexpected", () => { throw new Error("private-password-do-not-echo"); });
  app.use(apiErrorHandler);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const environment of ["development", "production"]) {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = environment;
      try {
        const cases = [
          ["/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"password":' }, 400, "Invalid JSON request."],
          ["/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "x".repeat(34000) }) }, 413, "Request body is too large."],
          ["/login", { method: "POST", headers: { "Content-Type": "application/json; charset=invalid" }, body: "{}" }, 415, "Unsupported request encoding."],
          ["/unexpected", {}, 500, "The request could not be completed."],
        ];
        for (const [route, options, status, message] of cases) {
          const response = await fetch(base + route, options);
          assert.equal(response.status, status);
          assert.match(response.headers.get("content-type"), /application\/json/);
          assert.deepEqual(await response.json(), { error: message });
        }
        const valid = await fetch(base + "/login", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: '{"password":"test"}',
        });
        assert.equal(valid.status, 200);
      } finally {
        if (original === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = original;
      }
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test("already-started responses delegate rather than double-send", () => {
  const error = new Error("test");
  let forwarded;
  apiErrorHandler(error, {}, { headersSent: true }, value => { forwarded = value; });
  assert.equal(forwarded, error);
});