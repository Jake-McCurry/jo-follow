import assert from "node:assert/strict";
import { test } from "node:test";
import { highlightSelectedVerses, selectionReference, toggleSelectedBookmarks, toggleSelectedVerse } from "../src/lib/bible-verse-selection.ts";
import { getVerseKey, parseImportedBibleStudyData, type BibleStudyData, type StudyVerse } from "../src/hooks/use-bible-study.ts";

const verse = (number: number): StudyVerse => ({
  id: getVerseKey("John", 1, number), bookName: "John", chapter: 1, verse: number, text: `Verse ${number}`, version: "NET",
});
const empty = (): BibleStudyData => ({ version: 1, bookmarks: [], highlights: {}, notes: {}, lastRead: null });

test("tapping verses toggles an ordered, unique selection", () => {
  let selected = toggleSelectedVerse([], verse(3));
  selected = toggleSelectedVerse(selected, verse(1));
  assert.deepEqual(selected.map(item => item.verse), [1, 3]);
  assert.deepEqual(toggleSelectedVerse(selected, verse(3)), [verse(1)]);
});

test("selection reference correctly distinguishes ranges and gaps", () => {
  assert.equal(selectionReference([]), "");
  assert.equal(selectionReference([verse(1)]), "John 1:1");
  assert.equal(selectionReference([verse(5), verse(2), verse(1), verse(3)]), "John 1:1–3, 5");
});

test("bulk save does not remove an already-saved member or unrelated data", () => {
  const original = toggleSelectedBookmarks(empty(), [verse(1), verse(9)]);
  const saved = toggleSelectedBookmarks(original, [verse(1), verse(2)]);
  assert.equal(saved.bookmarks.length, 3);
  assert.deepEqual(original.bookmarks.map(item => item.id), [verse(1).id, verse(9).id]);
  const removed = toggleSelectedBookmarks(saved, [verse(1), verse(2)]);
  assert.deepEqual(removed.bookmarks.map(item => item.id), [verse(9).id]);
});

test("bulk highlights preserve other verses and round-trip through backup/restore", () => {
  const original = highlightSelectedVerses(empty(), [verse(9)], "pink");
  const updated = highlightSelectedVerses(original, [verse(1), verse(2)], "blue");
  assert.equal(original.highlights[verse(1).id], undefined);
  assert.equal(updated.highlights[verse(1).id].color, "blue");
  assert.equal(updated.highlights[verse(2).id].color, "blue");
  assert.deepEqual(parseImportedBibleStudyData(JSON.stringify(updated)), updated);
  const cleared = highlightSelectedVerses(updated, [verse(1), verse(2)], null);
  assert.deepEqual(Object.keys(cleared.highlights), [verse(9).id]);
});
