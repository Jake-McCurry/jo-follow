import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const library = JSON.parse(readFileSync(new URL("../src/data/article-library.json", import.meta.url), "utf8"));

test("ALJ index includes all ten existing guide chapters in reading order", () => {
  const chapters = library.articles.filter((article: { group: string }) => article.group === "adventure")
    .sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  assert.equal(chapters.length, 10);
  assert.equal(chapters[0].slug, "adv-begin-the-adventure");
  assert.equal(chapters.at(-1)?.slug, "adv-continuing-with-jesus");
  assert.deepEqual(chapters.map((chapter: { order: number }) => chapter.order), Array.from({ length: 10 }, (_, index) => index));
  for (const chapter of chapters) {
    assert.ok(chapter.blocks.length > 0);
    assert.match(chapter.slug, /^adv-.+/);
    assert.ok(chapter.title.length > 0);
  }
});

test("ALJ index is registered and reuses canonical titles, routes and inline chevrons", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/pages/adv-index.tsx", import.meta.url), "utf8");
  assert.match(app, /path="\/adv1" component=\{AdventureIndexPage\}/);
  assert.match(page, /getArticlesInGroup\("adventure"\)/);
  assert.match(page, /getArticlePath\(chapter.slug\)/);
  assert.match(page, /ChevronLabel text=\{chapter.title\}/);
  assert.match(page, /import.meta.env.BASE_URL/);
});
