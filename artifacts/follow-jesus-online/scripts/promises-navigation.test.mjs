import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { knowingGodScriptureHref } from "../src/components/knowing-god/scripture-link.ts";
import { blockText, printedTranslations, searchTopics, scriptureHref, sortPromisePassages } from "../src/components/promises/promises-data.ts";
import { compareBibleReferences, matchesBiblePassageFilters } from "../src/lib/bible-order.ts";
import { verseNumbersFromHash } from "../src/lib/bible-verse-navigation.ts";

const root = new URL("../", import.meta.url);
const text = path => readFile(new URL(path, root), "utf8");

test("copied passages include references without duplicating printed citations", async () => {
  const book = JSON.parse(await text("public/promises/book.json"));
  for (const topic of book.groups.flatMap(group => group.topics)) {
    const passages = topic.blocks.filter(block => block.kind === "passage");
    const copied = blockText(passages);
    for (const passage of passages) {
      assert.ok(copied.includes(passage.text), `${topic.title}: preserve the quotation`);
      assert.ok(copied.includes(passage.reference), `${topic.title}: include the reference`);
    }
  }
  assert.equal(blockText([{ kind: "passage", text: "A quotation.", reference: "John 1:1", translation: "NET" }]), "A quotation.\n—John 1:1, NET");
  const printed = "A quotation. —John 1:1, NET";
  assert.equal(blockText([{ kind: "passage", text: printed, reference: "John 1:1", translation: "NET" }]), printed);
});

test("each topic has top print/share icons and a single passage-copy action", async () => {
  const reader = await text("src/components/promises/PromisesReader.tsx");
  assert.match(reader, /promises-topic-actions[\s\S]*Copy passages[\s\S]*aria-label="Print this topic"[\s\S]*Share this topic/);
  assert.match(reader, /title=\{`\$\{sel\.topic\.title\} \| \$\{book\.title\}`\}/);
  assert.doesNotMatch(reader, /Copy refs/);
});

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
  assert.match(sidebar, /onClick=\{\(\) => p\.onView\("intro"\)\}[\s\S]*?>Introduction<\/button>/);
  assert.match(reader, /blocks=\{book\.introduction\}/);
});

test("every Scripture reference links into Follow, with supplied verse spacing and base paths", async () => {
  const book = JSON.parse(await text("public/promises/book.json"));
  const blocks = [...book.introduction, ...book.groups.flatMap(group => [
    ...group.preamble, ...group.topics.flatMap(topic => topic.blocks),
  ])];
  for (const block of blocks) {
    if (block.kind !== "passage") continue;
    const reference = block.bibleReference ?? block.reference;
    const href = scriptureHref(reference, "/follow/");
    assert.match(href, /^\/follow\/bible\/[^/]+\/\d+#verse-\d+$/);
    const firstVerse = Number(reference.match(/:\s*(\d+)/)?.[1]);
    assert.deepEqual(verseNumbersFromHash(new URL(href, "https://example.test").hash), [firstVerse],
      `${reference}: the reader must receive the exact first cited verse`);
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

test("every category lists its complete passages in canonical book, chapter and verse order without changing source data", async () => {
  const book = JSON.parse(await text("public/promises/book.json"));
  const original = JSON.stringify(book);
  let checked = 0, reordered = 0;
  for (const group of book.groups) for (const topic of group.topics) {
    const ordered = sortPromisePassages(topic.blocks);
    assert.equal(ordered.length, topic.blocks.length);
    assert.deepEqual(new Set(ordered), new Set(topic.blocks), "keep original quotation objects and metadata");
    const passages = ordered.filter(b => b.kind === "passage");
    for (let i = 0; i < passages.length; i++) {
      const ref = passages[i].bibleReference ?? passages[i].reference;
      assert.ok(matchesBiblePassageFilters(ref, "Old Testament", "All books") ||
        matchesBiblePassageFilters(ref, "New Testament", "All books"), `${ref}: recognized canonical book`);
      if (i) assert.ok(compareBibleReferences(passages[i - 1].bibleReference ?? passages[i - 1].reference, ref) <= 0, topic.title);
      checked++;
    }
    if (ordered.some((block, i) => block !== topic.blocks[i])) reordered++;
    const copied = blockText(ordered);
    assert.ok(copied.indexOf(passages[0].text) <= copied.indexOf(passages.at(-1).text), "copy order follows display order");
  }
  assert.equal(checked, book.counts.passages);
  assert.ok(reordered > 0);
  assert.equal(JSON.stringify(book), original, "never rewrite the source corpus");
  const reader = await text("src/components/promises/PromisesReader.tsx");
  assert.match(reader, /topic: \{ \.\.\.topic, blocks: sortPromisePassages\(topic\.blocks\) \}/);
});

test("passage sorting is numeric, uses corrected citations, and preserves narrative boundaries and equal-citation order", () => {
  const passage = (reference, bibleReference) => ({ kind: "passage", reference, bibleReference, text: reference, sourceParagraphs: [] });
  const heading = { kind: "heading", text: "Next section" };
  const same = passage("John 3:16");
  const blocks = [
    passage("John 3:16"), passage("John 3:2"), passage("Corinthians 2:12", "1 Corinthians 2:12"),
    passage("Psalm 100:1"), passage("Psalm 23:1"), same, heading, passage("Revelation 21:4"), passage("Genesis 1:1"),
  ];
  const sorted = sortPromisePassages(blocks);
  assert.deepEqual(sorted.map(b => b.reference ?? b.text), [
    "Psalm 23:1", "Psalm 100:1", "John 3:2", "John 3:16", "John 3:16", "Corinthians 2:12",
    "Next section", "Genesis 1:1", "Revelation 21:4",
  ]);
  assert.equal(sorted[4], same);
  assert.equal(sorted[6], heading);
  assert.equal(scriptureHref("Psalm 33:20–22"), "/bible/Psalms/33#verse-20");
  assert.equal(scriptureHref("Romans 10: 9–10", "/follow/"), "/follow/bible/Romans/10#verse-9");
  assert.equal(scriptureHref("Jude 20–23"), "/bible/Jude/1#verse-20");
  assert.equal(scriptureHref(), null);
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

test("Promises sidebar keeps Introduction above groups and utilities in a quiet footer", async () => {
  const sidebar = await text("src/components/promises/PromisesSidebar.tsx");
  const reader = await text("src/components/promises/PromisesReader.tsx");
  assert.doesNotMatch(sidebar, /promises-search|promises-translation|Translation as printed|About, source and resources|onQuery|onTranslation/);
  assert.doesNotMatch(reader, /Groups &amp; search|setTranslation|setQuery/);
  assert.match(sidebar, /promises-sidebar-footer[\s\S]*Saved study[\s\S]*aria-label="Print this page"[\s\S]*Share this page[\s\S]*>Copyright<\/button>/);
  assert.ok(sidebar.indexOf(">Introduction</button>") < sidebar.indexOf(">Six groups</p>"));
  assert.ok(sidebar.indexOf("</nav>") < sidebar.indexOf("promises-sidebar-footer"));
});

test("Copyright view uses only the requested publisher and Scripture notices", async () => {
  const reader = await text("src/components/promises/PromisesReader.tsx");
  const copyright = await text("src/components/promises/PromisesCopyright.tsx");
  assert.match(reader, /view === "source"[\s\S]*?main = <PromisesCopyright \/>/);
  assert.doesNotMatch(reader, /blocks=\{book\.(publication|resources)\}|Download PDF|Download DOCX|Source, copyright and resources/);
  for (const notice of ["Published by JesusOnline Ministries", "copyright ©1996, 2019", "New Living Translation", "New International Version®", "Copyright © 2024 by JesusOnline Ministries", "JesusOnlineMinistries.org"]) {
    assert.ok(copyright.includes(notice), notice);
  }
  assert.match(copyright, /href="https:\/\/netbible\.com"/);
  assert.match(copyright, /href="https:\/\/JesusOnlineMinistries\.org"/);
});