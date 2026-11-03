import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildDevotionalHierarchy, countSubstantive, kjvScriptureHref, scriptureExcerpt, searchScripturePassages, uniqueDevotionalCount, uniqueSeeAlsoTargets } from "../src/components/knowing-god/knowing-god-ui.ts";

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
