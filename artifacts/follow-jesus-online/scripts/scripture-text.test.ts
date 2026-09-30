import assert from "node:assert/strict";
import test from "node:test";
import { splitScriptureText } from "../src/lib/scripture-text";

const reconstruct = (text: string) => splitScriptureText(text)
  .map((part) => `${part.prefix ?? ""}${part.text}${part.suffix ?? ""}`).join("");

test("chapter-only mentions never create Scripture tooltips", () => {
  const text = "Read Genesis 1, Romans 7 and Romans 8, Hebrews 11, Numbers 13, Psalm 1 and Luke 19.";
  assert.ok(splitScriptureText(text).every((part) => !part.reference));
  assert.equal(reconstruct(text), text);
});

test("shorthand chapter and verse citations have separate previews", () => {
  const text = "He has purchased you (Hebrews 7:25; 9:12).";
  const citations = splitScriptureText(text).filter((part) => part.reference);
  assert.deepEqual(citations.map((part) => part.reference), ["Hebrews 7:25", "Hebrews 9:12"]);
  assert.equal(citations[0].prefix, "(");
  assert.equal(citations[1].suffix, ")");
  assert.equal(reconstruct(text), text);
});

test("reference parentheses and translation labels stay attached", () => {
  for (const reference of [
    "Proverbs 20:6", "Psalm 119:11", "Lamentations 3:22-23, NLT",
    "Hebrews 10:24-25, NIV", "Ephesians 2:10, NIV", "Isaiah 30:21, NIV",
    "Psalm 119:105, NIV", "Romans 8:38-39",
  ]) {
    const text = `A promise (${reference}).`;
    const citation = splitScriptureText(text).find((part) => part.reference);
    assert.equal(citation?.prefix, "(");
    assert.ok(citation?.suffix?.endsWith(")"));
    assert.equal(reconstruct(text), text);
  }
});

test("each Acts passage has a separate verse-range preview", () => {
  const text = "Acts 2:42-47, Acts 4:32-35 and Acts 11:27-30.";
  assert.deepEqual(splitScriptureText(text).filter((part) => part.reference).map((part) => part.reference),
    ["Acts 2:42-47", "Acts 4:32-35", "Acts 11:27-30"]);
  assert.equal(reconstruct(text), text);
});