import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import express from "express";
import cookieParser from "cookie-parser";
import { PgDialect } from "drizzle-orm/pg-core";
import { reactionArticleSlugs } from "../scripts/reaction-article-catalog.mjs";

test("catalog includes published sources and excludes retired and invented articles", async () => {
  const slugs = new Set(await reactionArticleSlugs());
  const dataRoot = new URL("../../follow-jesus-online/src/data/", import.meta.url);
  const library = JSON.parse(await readFile(new URL("article-library.json", dataRoot), "utf8"));
  for (const article of library.articles) {
    assert.equal(slugs.has(article.slug), !article.retired, article.slug);
  }
  for (const filename of ["imported-deeper-articles.json", "linked-articles.json"]) {
    for (const article of JSON.parse(await readFile(new URL(filename, dataRoot), "utf8"))) {
      assert.ok(slugs.has(article.slug), article.slug);
    }
  }
  assert.ok(slugs.has("adv-prayer"));
  assert.ok(slugs.has("gf-a-heart-after-god-the-restless-heart"));
  assert.ok(slugs.has("gf-a-heart-after-god-the-heart-reflects-the-person"));
  assert.ok(!slugs.has("pentest-nonexistent-zzz123"));
  assert.ok(!slugs.has("gf-a-heart-after-god-invented"));
});

test("reaction routes reject unknown articles before cookies or database access; real reactions still work", async () => {
  const temp = await mkdtemp(new URL("./.reaction-test-", import.meta.url));
  let server;
  const records = new Map();
  let accesses = 0;
  // Bundle the actual router, replacing only persistence with an in-memory spy.
  globalThis.__reactionTestDb = {
    select(selection) {
      accesses++;
      return { from() { return { where(condition) {
        if ("helpful" in selection) return Promise.resolve([{ helpful: 0, encouraging: 0 }]);
        const [slug, hash] = new PgDialect().sqlToQuery(condition).params;
        return { limit: async () => {
          const reaction = records.get(`${slug}:${hash}`);
          return reaction ? [{ reaction }] : [];
        } };
      } }; } };
    },
    insert() {
      accesses++;
      return { values(row) { return { async onConflictDoUpdate() {
        records.set(`${row.articleSlug}:${row.visitorHash}`, row.reaction);
      } }; } };
    },
  };
  try {
    await build({
      entryPoints: [new URL("../src/routes/reactions.ts", import.meta.url).pathname],
      outfile: `${temp}/router.mjs`,
      bundle: true,
      platform: "node",
      format: "esm",
      external: ["express", "drizzle-orm"],
      define: { __REACTION_ARTICLE_SLUGS__: JSON.stringify(await reactionArticleSlugs()) },
      plugins: [{
        name: "persistence-spy",
        setup(builder) {
          builder.onResolve({ filter: /^@workspace\/db$/ }, () => ({ path: "db", namespace: "test-db" }));
          builder.onLoad({ filter: /.*/, namespace: "test-db" }, () => ({
            contents: `
              import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
              export const db = globalThis.__reactionTestDb;
              export const articleReactionsTable = pgTable("article_reactions", {
                articleSlug: text("article_slug"), visitorHash: text("visitor_hash"),
                reaction: text("reaction"), updatedAt: timestamp("updated_at"),
              });
            `,
          }));
        },
      }],
    });
    const { default: router } = await import(pathToFileURL(`${temp}/router.mjs`).href);
    const app = express();
    app.use(express.json(), cookieParser());
    app.use("/api", router);
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}/api/articles/`;
    for (const cookie of [undefined, "jo_reaction_visitor=11111111-1111-4111-8111-111111111111"]) {
      for (const slug of ["pentest-nonexistent-zzz123", "adv-invented", "gf-a-heart-after-god-invented"]) {
        for (const method of ["GET", "PUT"]) {
          const response = await fetch(`${base}${slug}/reactions`, {
            method,
            headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
            ...(method === "PUT" ? { body: '{"reaction":"helpful"}' } : {}),
          });
          assert.equal(response.status, 404);
          assert.deepEqual(await response.json(), { error: "Article not found." });
          assert.equal(response.headers.get("set-cookie"), null);
        }
      }
    }
    assert.equal(accesses, 0);
    assert.equal(records.size, 0);
    for (const [slug, body] of [["bad!slug", '{"reaction":"helpful"}'], ["adv-prayer", '{"reaction":null}']]) {
      const response = await fetch(`${base}${slug}/reactions`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body,
      });
      assert.equal(response.status, 400);
    }
    assert.equal(accesses, 0);
    for (const slug of ["adv-prayer", "deeper-the-need-for-a-new-heart", "more-who-is-god", "gf-a-heart-after-god-the-restless-heart"]) {
      const response = await fetch(`${base}${slug}/reactions`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: '{"reaction":"helpful"}',
      });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).selected, "helpful");
      const cookie = response.headers.get("set-cookie").split(";")[0];
      const reread = await fetch(`${base}${slug}/reactions`, { headers: { Cookie: cookie } });
      assert.equal(reread.status, 200);
      assert.equal((await reread.json()).selected, "helpful");
      const changed = await fetch(`${base}${slug}/reactions`, {
        method: "PUT", headers: { "Content-Type": "application/json", Cookie: cookie },
        body: '{"reaction":"encouraging"}',
      });
      assert.equal(changed.status, 200);
      assert.equal((await changed.json()).selected, "encouraging");
      const other = await fetch(`${base}${slug}/reactions`);
      assert.equal((await other.json()).selected, null);
    }
    assert.equal(records.size, 4);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    delete globalThis.__reactionTestDb;
    await rm(temp, { recursive: true, force: true });
  }
});