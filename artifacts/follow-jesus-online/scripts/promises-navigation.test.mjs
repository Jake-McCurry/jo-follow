import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { knowingGodScriptureHref } from "../src/components/knowing-god/scripture-link.ts";
import { printedTranslations, searchTopics } from "../src/components/promises/promises-data.ts";

const root = new URL("../", import.meta.url);
const text = path => readFile(new URL(path, root), "utf8");

test("sticky Promises menu and homepage card both open the new reader", async () => {
  const data = await text("src/data/connect-with-god.ts");
  assert.match(data, /\{ label: "Promises", href: "\/promises" \}/);
  assert.match(data, /title: "God\\u2019s Promises for Hope",[\s\S]*?href: "\/promises"/);
  const app = await text("src/App.tsx");
  assert.match(app, /<Route path="\/promises" component=\{PromisesPage\}/);
});

test("search covers the full book and tolerates smart punctuation", async () => {
  const book = JSON.parse(await text("public/promises/book.json"));
  assert.ok(searchTopics(book, "God's Presence").some(hit => hit.topic.id === "situation-awareness-of-god-s-presence"));
  assert.ok(searchTopics(book, "never will I forsake you").some(hit => hit.topic.id === "situation-abandonment"));
  assert.ok(searchTopics(book, "Romans 10: 9").some(hit => hit.topic.id === "situation-salvation-justification"));
  assert.deepEqual(searchTopics(book, "no-promises-match-this-word"), []);
  assert.deepEqual(printedTranslations(book), ["HCSB", "ISV", "KJV", "NET", "NIV", "NLT", "TLB"]);
});

test("Promises opens the Introduction and no longer exposes an Overview page", async () => {
  const reader = await text("src/components/promises/PromisesReader.tsx");
  const sidebar = await text("src/components/promises/PromisesSidebar.tsx");
  assert.match(reader, /useState<View>\("intro"\)/);
  assert.doesNotMatch(reader, /"overview"|>Overview</);
  assert.doesNotMatch(sidebar, /"overview"|>Overview</);
  assert.match(sidebar, /nav\("intro", "Introduction"\)/);
  assert.match(reader, /blocks=\{book\.introduction\}/);
});

test("every Scripture reference links into Follow, with supplied verse spacing and base paths", async () => {
  const book = JSON.parse(await text("public/promises/book.json"));
  const blocks = [...book.introduction, ...book.groups.flatMap(group => [
    ...group.preamble, ...group.topics.flatMap(topic => topic.blocks),
  ])];
  for (const block of blocks) {
    if (block.kind !== "passage") continue;
    const href = knowingGodScriptureHref(block.bibleReference ?? block.reference, "/follow/");
    assert.match(href, /^\/follow\/bible\/[^/]+\/\d+(?:#verse-\d+)?$/);
    assert.doesNotMatch(href, /\/Corinthians\//);
  }
  assert.equal(knowingGodScriptureHref("Romans 10: 9–10", "/follow/"), "/follow/bible/Romans/10#verse-9");
  assert.equal(knowingGodScriptureHref("Matthew 28:20b"), "/bible/Matthew/28#verse-20");
  for (const name of ["PromisesReader", "PromisesSidebar", "PromiseBlocks"]) {
    const source = await text(`src/components/promises/${name}.tsx`);
    assert.doesNotMatch(source, /href\s*=\s*["'](?:https?:|mailto:)/);
    assert.doesNotMatch(source, /<main(?:\s|>)/);
  }
  const page = await text("src/pages/promises/index.tsx");
  assert.match(page, /<KnowingGodShell warmWrapper>/);
});

test("fear title matches come before content matches without dropping any results", async () => {
  const book = JSON.parse(await text("public/promises/book.json"));
  const matches = searchTopics(book, "fear");
  const titles = book.groups.flatMap(group => group.topics)
    .filter(topic => topic.title.toLowerCase().includes("fear"));
  assert.ok(titles.length > 0);
  assert.ok(matches.length > titles.length, "Content-only results remain available");
  assert.deepEqual(matches.slice(0, titles.length).map(match => match.topic.id), titles.map(topic => topic.id));
  assert.ok(matches.slice(0, titles.length).every(match => match.hit === "Title"));
  assert.ok(matches.slice(titles.length).every(match => match.hit !== "Title"));
  assert.equal(new Set(matches.map(match => match.topic.id)).size, matches.length);
});

test("title, reference and content tiers override source order and ignore query case", () => {
  const book = { groups: [{ id: "test", title: "Test", topics: [
    { id: "content", title: "Hope", blocks: [{ text: "John wrote about hope." }] },
    { id: "reference", title: "Life", blocks: [{ reference: "John 1:1", text: "In the beginning" }] },
    { id: "title", title: "John’s example", blocks: [{ text: "An example" }] },
  ] }] };
  assert.deepEqual(searchTopics(book, "  JOHN  ").map(match => match.topic.id), ["title", "reference", "content"]);
  assert.deepEqual(searchTopics(book, " "), []);
});