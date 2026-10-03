import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { knowingGodScriptureHref } from "../src/components/knowing-god/scripture-link.ts";
import test from "node:test";

const root = new URL("../", import.meta.url);
const json = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));

test("Knowing God navigation stays in Follow, including all supplemental Scripture destinations", async () => {
  const dir = new URL("src/components/knowing-god/", root);
  const files = (await readdir(dir)).filter((name) => /\.(?:tsx?|mjs)$/.test(name));
  for (const name of files) {
    const source = await readFile(new URL(name, dir), "utf8");
    assert.doesNotMatch(source, /equip\.jesusonline\.com|biblegateway\.com/, name);
    assert.doesNotMatch(source, /href\s*=\s*["'](?:https?:|mailto:)/, name);
  }
  const shell = await readFile(new URL("KnowingGodShell.tsx", dir), "utf8");
  assert.match(shell, /<Layout>/);
  assert.equal(knowingGodScriptureHref("Psalm 23:1-6"), "/bible/Psalms/23#verse-1");
  assert.equal(knowingGodScriptureHref("Jude 20-23"), "/bible/Jude/1#verse-20");
  assert.equal(knowingGodScriptureHref("2 John 1-6", "/follow/"), "/follow/bible/2%20John/1#verse-1");
  assert.equal(knowingGodScriptureHref("3 John 1:12"), "/bible/3%20John/1#verse-12");
  const index = await json("public/knowing-god/data/index.json");
  for (const name of new Set(index.topics.map((item) => item.payload))) {
    for (const topic of (await json(`public/knowing-god/data/${name}`)).topics) {
      for (const section of topic.additionalScripture) {
        for (const link of section.links) {
          for (const query of link.queries) {
            assert.match(knowingGodScriptureHref(query, "/follow/"), /^\/follow\/bible\/[^/]+\/\d+(?:#verse-\d+)?$/, query);
          }
        }
      }
    }
  }
});

test("Knowing God content, introductory data and assets retain their source checksums", async () => {
  const manifest = await json("scripts/data/knowing-god-source-manifest.json");
  let checked = 0;
  for (const [sourcePath, expected] of Object.entries(manifest)) {
    const path = sourcePath.replace(/^artifacts\/discipleship-hub\//, "");
    if (!path.startsWith("public/knowing-god/") &&
        !path.startsWith("src/assets/") &&
        !path.startsWith("src/data/knowing-god/") &&
        path !== "src/data/knowingGodIntroductions.ts" &&
        path !== "public/books/covers/knowing-god.jpg") continue;
    const bytes = await readFile(new URL(path, root));
    assert.equal(bytes.length, expected.bytes, path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected.sha256, path);
    checked++;
  }
  assert.ok(checked > 100, `Expected complete source content, checked only ${checked} files`);
});

test("the complete topic corpus matches all six published metrics", async () => {
  const index = await json("public/knowing-god/data/index.json");
  const payloadNames = [...new Set(index.topics.map((item) => item.payload))];
  const records = (await Promise.all(payloadNames.map(async (name) =>
    (await json(`public/knowing-god/data/${name}`)).topics))).flat();
  const counts = {
    topicCount: records.length,
    crossReferenceCount: records.filter((item) => item.recordType === "cross-reference").length,
    passageCount: records.reduce((sum, item) => sum + item.passages.length, 0),
    // The source metric counts records with supplemental Scripture, not
    // individual sections (625 records contain 627 sections).
    additionalScriptureCount: records.filter((item) => item.additionalScripture.length > 0).length,
    seeAlsoLinkCount: records.reduce((sum, item) => sum + item.seeAlso.length, 0),
    sourceMarkerCount: records.reduce((sum, item) => sum + item.sourceMarkers.length, 0),
  };
  assert.deepEqual(counts, index.counts);
  assert.deepEqual(counts, {
    topicCount: 773, crossReferenceCount: 124, passageCount: 13535,
    additionalScriptureCount: 625, seeAlsoLinkCount: 9431, sourceMarkerCount: 2,
  });
  assert.deepEqual(new Set(records.map((item) => item.id)), new Set(index.topics.map((item) => item.id)));
  assert.equal(new Set(records.map((item) => item.id)).size, 773);
});

test("the feature routes and menu/card links are registered without changing the reflection link", async () => {
  const app = await readFile(new URL("src/App.tsx", root), "utf8");
  for (const path of ["/knowing-god", "/knowing-god/introduction", "/knowing-god/introduction/:section"]) {
    assert.ok(app.includes(`path="${path}"`), `Missing route ${path}`);
  }
  const data = await readFile(new URL("src/data/connect-with-god.ts", root), "utf8");
  assert.match(data, /label: "Knowing God", href: "\/knowing-god"/);
  assert.match(data, /title: "Knowing God \/ Topical Concordance",[\s\S]*?href: "\/knowing-god"/);
  assert.match(data, /title: "Reflecting on God(?:’|\\u2019)s Majesty",[\s\S]*?href: "\/gf\/beholding-the-majesty-of-god"/);
});