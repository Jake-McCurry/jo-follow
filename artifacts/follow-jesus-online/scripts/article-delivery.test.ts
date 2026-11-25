import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { loadConfigFromFile } from "vite";
import { createArticleContentLoader } from "../src/lib/article-content-loader";
import type { Article } from "../src/data/article-library";

const config = await loadConfigFromFile({ command: "build", mode: "production" }, new URL("../vite.config.ts", import.meta.url).pathname);
const plugins = config!.config.plugins!.flat() as { name: string; load?: (id: string) => string }[];
const pages = plugins.find(plugin => plugin.name === "follow-article-pages")!;
const catalog = pages.load!("\0virtual:article-pages");
const summaries = JSON.parse(catalog.split("export const articles=")[1].split(";export const companions=")[0]);
const articles: Article[] = summaries.map((summary: Article) => JSON.parse(
  pages.load!(`\0virtual:article-page/${summary.slug}`).replace(/^export default /, "").replace(/;$/, ""),
));

test("each published article has one exact, independently loadable body and metadata-only summary", () => {
  assert.ok(articles.length > 50);
  assert.equal(new Set(articles.map(article => article.slug)).size, articles.length);
  assert.ok(summaries.every((article: object) => !("blocks" in article)));
  for (const [index, article] of articles.entries()) {
    const { blocks, ...summary } = article;
    assert.deepEqual(summary, summaries[index]);
    assert.ok(Array.isArray(blocks) && blocks.length > 0, article.slug);
    assert.ok(catalog.includes(`import("virtual:article-page/${article.slug}")`));
  }
  assert.throws(() => pages.load!("\0virtual:article-page/not-a-real-article"), /Unknown article/);
  assert.ok(JSON.stringify(summaries).length < JSON.stringify(articles).length / 3);
});

test("all content and companion links match the exact pre-refactor snapshot when available", t => {
  const file = new URL("../../../generated-artifacts/performance/article-content-baseline.json", import.meta.url);
  if (!existsSync(file)) return t.skip("The local pre-refactor snapshot is not part of clean CI checkouts; source-fidelity checks still run.");
  const baseline = JSON.parse(readFileSync(file, "utf8"));
  assert.deepEqual(articles, baseline.articles);
  const companions = JSON.parse(catalog.split(";export const companions=")[1].split(";export const loaders=")[0]);
  assert.deepEqual(companions, baseline.companions);
});

test("article requests deduplicate, isolate bodies, cache successes and retry explicit failures", async () => {
  const [first, second] = articles;
  let firstCalls = 0;
  let secondCalls = 0;
  const loader = createArticleContentLoader({
    [first.slug]: async () => { firstCalls++; return first; },
    [second.slug]: async () => { secondCalls++; if (secondCalls === 1) throw new Error("Offline"); return second; },
    invalid: async () => first,
  });
  const one = loader.load(first.slug);
  assert.equal(one, loader.load(first.slug));
  assert.equal(await one, first);
  assert.equal(await loader.load(first.slug), first);
  assert.equal(firstCalls, 1);
  assert.equal(secondCalls, 0, "Reading one article does not request another.");
  await assert.rejects(loader.load(second.slug), /Offline/);
  assert.equal(loader.get(second.slug), undefined);
  assert.equal(await loader.load(second.slug), second);
  assert.equal(secondCalls, 2);
  await assert.rejects(loader.load("missing"), /Article not found/);
  await assert.rejects(loader.load("constructor"), /Article not found/);
  await assert.rejects(loader.load("invalid"), /Invalid article content/);
  assert.equal(loader.get("invalid"), undefined);
});
