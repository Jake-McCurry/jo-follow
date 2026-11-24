import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { matchesBiblePassageFilters } from "../src/lib/bible-order.ts";
import { buildDevotionalHierarchy, countSubstantive, kjvScriptureHref, scopeKnowingGodTopics, scriptureResultHref, scriptureExcerpt, searchScripturePassages, uniqueDevotionalCount, uniqueSeeAlsoTargets } from "../src/components/knowing-god/knowing-god-ui.ts";

const index = JSON.parse(readFileSync(new URL("../public/knowing-god/data/index.json", import.meta.url), "utf8"));

test("counts substantive topics and keeps cross-references", () => {
  assert.equal(index.topics.length, 773);
  assert.equal(countSubstantive(index.topics), 649);
  assert.equal(index.topics.length - countSubstantive(index.topics), 124);
  assert.equal(index.counts.passageCount, 13535);
});

test("devotional hierarchy resolves 502 unique topics in source order", () => {
  const groups = buildDevotionalHierarchy(index.topics);
  assert.equal(groups[0].heading, "ALMIGHTY");
  assert.equal(groups[0].children[0].label, "ABLE");
  assert.equal(uniqueDevotionalCount(groups), 502);
});

test("scripture search merges identical passages and excerpts the match", () => {
  const p = { reference: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son" };
  const r = searchScripturePassages([{ id: "a", passages: [p] }, { id: "b", passages: [p] }], "LOVED");
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].topicIds, ["a", "b"]);
  assert.match(scriptureExcerpt("x ".repeat(100) + "needle" + " y".repeat(100), "needle"), /^….*needle.*…$/);
});

test("KJV links and unique see-also targets", () => {
  assert.equal(kjvScriptureHref("John 3:16"), "/bible/John/3?version=KJV#verse-16");
  assert.deepEqual(uniqueSeeAlsoTargets([{ targetIds: ["a", "b"] }, { targetIds: ["b", "c"] }]), ["a", "b", "c"]);
});

test("Scripture results follow Bible book order, then numeric chapter and verse, before pagination", () => {
  const expected = [
    "Genesis 1:1", "Genesis 2:3", "Genesis 2:10", "Genesis 10:1",
    "II Samuel 5:6-7", "2 Kings 1:1", "II Chronicles 6:5-6",
    "Psalm 23:4", "Matthew 1:1", "John 3:2", "John 3:16-18",
    "1 Corinthians 1:1", "2 Corinthians 1:1", "2 John 5", "Jude 24", "Revelation 22:21",
  ];
  const topics = [...expected].reverse().map((reference, i) => ({
    id: `topic-${i}`, passages: [{ reference, text: "matching text" }],
  }));
  assert.deepEqual(searchScripturePassages(topics, "matching").map(p => p.reference), expected);
  assert.deepEqual(topics[0].passages[0].reference, expected.at(-1), "source order is not mutated");
});

test("selected translation controls matches, excerpts, and links without a KJV fallback", () => {
  const passage = { reference: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son" };
  const topics = [{ id: "a", passages: [passage] }, { id: "b", passages: [passage] }];
  const net = new Map([["John 3:16", "For this is the way God loved the world: He gave his one and only Son"]]);
  assert.equal(searchScripturePassages(topics, "begotten", "NET", net).length, 0);
  assert.equal(searchScripturePassages(topics, "begotten", "KJV", net).length, 1);
  assert.equal(searchScripturePassages(topics, "one and only", "KJV", net).length, 0);
  const matches = searchScripturePassages(topics, "one and only", "NET", net);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].text, net.get("John 3:16"));
  assert.match(matches[0].excerpt, /one and only/);
  assert.deepEqual(matches[0].topicIds, ["a", "b"]);
  assert.equal(searchScripturePassages(topics, "begotten", "NET").length, 0, "missing NET text must not use KJV");
  assert.equal(searchScripturePassages(topics, "begotten", "NET", new Map([["John 3:16", ""]])).length, 0);
  assert.equal(scriptureResultHref("John 3:16", "NET"), "/bible/John/3?version=NET#verse-16");
  assert.equal(scriptureResultHref("John 3:16", "KJV", "/follow/"), "/follow/bible/John/3?version=KJV#verse-16");
});

test("search uses the real local NET text and preserves the original KJV corpus", () => {
  const manifest = JSON.parse(readFileSync(new URL("../public/knowing-god/net/manifest.json", import.meta.url), "utf8"));
  const netBook = JSON.parse(readFileSync(new URL(`../public/knowing-god/net/${manifest.passages["John 3:16"]}`, import.meta.url), "utf8"));
  const topics = JSON.parse(readFileSync(new URL("../public/knowing-god/data/topics-l.json", import.meta.url), "utf8")).topics;
  const before = JSON.stringify(topics);
  const cache = new Map(Object.entries(netBook) as [string, string][]);
  const results = searchScripturePassages(topics, "one and only", "NET", cache);
  assert.ok(results.some(p => p.reference === "John 3:16-18"));
  assert.ok(results.every(p => p.text === cache.get(p.reference)));
  assert.equal(JSON.stringify(topics), before);
});

test("search UI and loading are wired to the current translation", () => {
  const reader = readFileSync(new URL("../src/components/knowing-god/ConcordancePrototype.tsx", import.meta.url), "utf8");
  const results = readFileSync(new URL("../src/components/knowing-god/TopicSearchResults.tsx", import.meta.url), "utf8");
  assert.match(reader, /searchScripturePassages\(loadedSearchTopics, query, translation, netCache, netNotes\)/);
  assert.match(reader, /<TopicSearchResults query=\{query\} translation=\{translation\}/);
  assert.match(reader, /fetchNetPassages\(references, 3, controller.signal\)/);
  assert.match(results, /scriptureResultHref\(result.reference, translation,/);
  assert.match(results, /setShown\(BATCH\), \[query, scope, translation, testament, book\]/);
  assert.match(results, /const BATCH = 25/);
  assert.doesNotMatch(results, /No KJV passages|opens KJV Bible|original KJV text/);
});

test("passage filters apply testament and exact Bible book identity to NET and KJV results", () => {
  const passages = [
    { reference: "Genesis 1:1", text: "matching creation" },
    { reference: "Psalm 23:1", text: "matching shepherd" },
    { reference: "John 3:16", text: "matching love" },
    { reference: "1 John 4:8", text: "matching love" },
    { reference: "II Samuel 5:6-7", text: "matching city" },
  ];
  const net = new Map(passages.map(p => [p.reference, `NET ${p.text}`]));
  for (const translation of ["NET", "KJV"] as const) {
    const results = searchScripturePassages([{ id: "a", passages }], "matching", translation, net);
    const filtered = (testament: string, book: string) => results
      .filter(p => matchesBiblePassageFilters(p.reference, testament, book)).map(p => p.reference);
    assert.deepEqual(filtered("All Testaments", "All books"), results.map(p => p.reference));
    assert.deepEqual(filtered("New Testament", "All books"), ["John 3:16", "1 John 4:8"]);
    assert.deepEqual(filtered("All Testaments", "John"), ["John 3:16"]);
    assert.deepEqual(filtered("Old Testament", "John"), []);
    assert.deepEqual(filtered("Old Testament", "Psalms"), ["Psalm 23:1"]);
    assert.deepEqual(filtered("All Testaments", "2 Samuel"), ["II Samuel 5:6-7"]);
  }
});

test("search filter controls affect Scripture only, reset result batches, and can be cleared", () => {
  const reader = readFileSync(new URL("../src/components/knowing-god/ConcordancePrototype.tsx", import.meta.url), "utf8");
  const results = readFileSync(new URL("../src/components/knowing-god/TopicSearchResults.tsx", import.meta.url), "utf8");
  assert.match(reader, /\.filter\(result => matchesBiblePassageFilters\(result.reference, testament, book\)\)/);
  assert.match(reader, /translation=\{translation\} scope=\{mode\} testament=\{testament\} book=\{book\}/);
  assert.match(reader, /if \(book !== "All books" && !matchesBiblePassageFilters/);
  assert.match(results, /onClick=\{onClearPassageFilters\}/);
  const topicSearch = reader.match(/const topicMatches = useMemo\([\s\S]*?\[scopedTopics, query\]\)/)?.[0];
  assert.ok(topicSearch, "topic-title search remains independent of passage filters");
  assert.doesNotMatch(topicSearch, /matchesBiblePassageFilters/);
});

test("devotional search scope limits titles and passage sources without changing the full index", () => {
  const groups = buildDevotionalHierarchy(index.topics);
  const scoped = scopeKnowingGodTopics(index.topics, "devotional", groups);
  assert.equal(scoped.length, 502);
  assert.equal(scopeKnowingGodTopics(index.topics, "all", groups), index.topics);
  assert.equal(index.topics.length, 773);
  const groupsFixture = [{ key: "g", heading: "Group", children: [{ key: "x", label: "First", topicId: "first" }] }];
  const topics = [
    { id: "first", title: "Faith", recordType: "topic", passages: [{ reference: "John 3:16", text: "matching faith" }] },
    { id: "other", title: "Other Faith", recordType: "topic", passages: [{ reference: "Genesis 1:1", text: "matching creation" }] },
  ];
  const devotional = scopeKnowingGodTopics(topics, "devotional", groupsFixture);
  assert.deepEqual(devotional.map(topic => topic.id), ["first"]);
  assert.deepEqual(searchScripturePassages(devotional, "matching").map(result => result.reference), ["John 3:16"]);
  const reader = readFileSync(new URL("../src/components/knowing-god/ConcordancePrototype.tsx", import.meta.url), "utf8");
  assert.match(reader, /\.filter\(topic => scopedTopicIds.has\(topic.id\)\)/);
  assert.match(reader, /const scriptureHref = \(reference: string\) => scriptureResultHref\(reference, translation,/);
  const close = reader.match(/const closeSearch = \(\) => \{[\s\S]*?\n  \};/)?.[0];
  assert.ok(close);
  assert.doesNotMatch(close, /setView|setSelectedId|pushState|pushTopicHash/);
});

test("NET reference notes accompany matches but never create matches", () => {
  const topics = [{ id: "faith", passages: [{ reference: "John 3:16", text: "KJV only begotten Son" }] }];
  const net = new Map([["John 3:16", "God gave his one and only Son"]]);
  const notes = new Map([["John 3:16", "Special translator explanation about unique wording"]]);
  const matches = searchScripturePassages(topics, "one and only", "NET", net, notes);
  assert.equal(matches[0].note, notes.get("John 3:16"));
  assert.equal(searchScripturePassages(topics, "translator explanation", "NET", net, notes).length, 0);
  assert.equal(searchScripturePassages(topics, "begotten", "KJV", net, notes)[0].note, undefined);
  const ui = readFileSync(new URL("../src/components/knowing-god/TopicSearchResults.tsx", import.meta.url), "utf8");
  assert.match(ui, /result.note &&[\s\S]*Translation note:[\s\S]*result.note/);
});

test("alternate book names resolve, filter, sort and deduplicate while printed references remain untouched", () => {
  const topics = [
    { id: "a", passages: [
      { reference: "Psalm 23:1", text: "matching shepherd" },
      { reference: "II Samuel 5:6", text: "matching city" },
      { reference: "Song of Songs 2:1", text: "matching flower" },
    ] },
    { id: "b", passages: [{ reference: "Psalms 23:1", text: "matching shepherd" }] },
  ];
  const matches = searchScripturePassages(topics, "matching");
  assert.deepEqual(matches.map(result => result.reference), ["II Samuel 5:6", "Psalm 23:1", "Song of Songs 2:1"]);
  assert.deepEqual(matches[1].topicIds, ["a", "b"]);
  assert.ok(matchesBiblePassageFilters("Song of Songs 2:1", "Old Testament", "Song of Solomon"));
  assert.ok(matchesBiblePassageFilters("Psalm 23: 1", "Old Testament", "Psalms"));
  assert.equal(scriptureResultHref("II Samuel 5:6-7", "KJV"), "/bible/2%20Samuel/5?version=KJV#verse-6");
  assert.equal(scriptureResultHref("Song of Songs 2:1–3", "NET"), "/bible/Song%20of%20Solomon/2?version=NET#verse-1");
  assert.equal(scriptureResultHref("II John 9-10", "NET"), "/bible/2%20John/1?version=NET#verse-9");
  assert.equal(scriptureResultHref("Kings 8:56", "NET"), "/bible/1%20Kings/8?version=NET#verse-56");
  assert.equal(topics[1].passages[0].reference, "Psalms 23:1");
});
