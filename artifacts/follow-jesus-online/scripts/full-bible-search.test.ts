import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { performance } from "node:perf_hooks";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { BIBLE_BOOKS } from "../src/lib/bible-order";
import {
  bibleResultPage, bibleVerseMatches, indexBibleVerses, normalizeBibleSearch,
  type BibleVerse, type BibleSearchResponse,
} from "../src/lib/full-bible-search";
import { scriptureResultHref } from "../src/components/knowing-god/knowing-god-ui";

const root = new URL("../public/knowing-god/bible-search/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("manifest.json", root), "utf8"));
function rows(version: "NET" | "KJV"): BibleVerse[] {
  return manifest.translations[version].shards.flatMap((shard: { file: string }) =>
    JSON.parse(readFileSync(new URL(shard.file, root), "utf8")));
}

test("both local corpora cover all books, chapters and approved coordinates with verified hashes", () => {
  const bounds = JSON.parse(readFileSync(new URL("../src/data/bible-verse-counts.json", import.meta.url), "utf8")).counts;
  assert.deepEqual(manifest.books, BIBLE_BOOKS);
  const expected = new Set<string>();
  bounds.forEach((chapters: number[], b: number) => chapters.forEach((count, c) => {
    for (let v = 1; v <= count; v++) expected.add(`${BIBLE_BOOKS[b]} ${c + 1}:${v}`);
  }));
  for (const version of ["NET", "KJV"] as const) {
    const info = manifest.translations[version];
    const verses = rows(version);
    const actual = new Set(verses.map(([b, c, v]) => `${BIBLE_BOOKS[b]} ${c}:${v}`));
    const wanted = new Set(expected);
    info.omittedTraditionalVerses.forEach((ref: string) => wanted.delete(ref));
    assert.deepEqual(actual, wanted);
    assert.equal(actual.size, verses.length);
    assert.equal(new Set(verses.map(v => v[0])).size, 66);
    assert.equal(verses.length, info.verseCount);
    assert.equal(verses.length, version === "NET" ? 31085 : 31102);
    const sorted = [...verses].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
    assert.deepEqual(verses, sorted);
    let compressedBytes = 0;
    for (const shard of info.shards) {
      const bytes = readFileSync(new URL(shard.file, root));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), shard.sha256);
      assert.ok(bytes.length < 270000);
      compressedBytes += gzipSync(bytes).length;
    }
    assert.ok(compressedBytes < 1_500_000, "each selected translation transfers under 1.5 MB with gzip");
    console.log(`${version}: ${verses.length} verses; ${compressedBytes.toLocaleString()} gzip bytes`);
  }
  assert.equal(manifest.translations.NET.omittedTraditionalVerses.length, 17);
  assert.match(manifest.translations.NET.coverageNotes, /2 Corinthians 13/);
});

test("full Bible search finds material outside the curated Knowing God passages", () => {
  const curatedRoot = new URL("../public/knowing-god/data/", import.meta.url);
  const allCuratedText = readdirSync(curatedRoot).filter(f => /^topics-.*\.json$/.test(f))
    .flatMap(f => JSON.parse(readFileSync(new URL(f, curatedRoot), "utf8")).topics)
    .flatMap(t => t.passages.map((p: { text: string }) => p.text)).join(" ");
  // A genealogical name not present in any of the original curated quotations.
  assert.ok(!normalizeBibleSearch(allCuratedText).includes("kedemah"));
  for (const version of ["NET", "KJV"] as const) {
    const index = indexBibleVerses(rows(version));
    const matches = index.flatMap((item, i) => bibleVerseMatches(item, "kedemah", { testament: "All Testaments", book: "All books" }) ? [i] : []);
    assert.ok(bibleResultPage(index, matches, 1).results.some(p => p.reference === "Genesis 25:15"));
  }
});

test("word and phrase searches normalize punctuation and use the selected text only", () => {
  assert.equal(normalizeBibleSearch("  GOD’S — Word!  "), "god s word");
  assert.equal(normalizeBibleSearch("..."), "");
  const filters = { testament: "New Testament", book: "John" };
  const find = (version: "NET" | "KJV", query: string) => {
    const index = indexBibleVerses(rows(version));
    const matches = index.flatMap((item, i) => bibleVerseMatches(item, normalizeBibleSearch(query), filters) ? [i] : []);
    return bibleResultPage(index, matches, 1).results;
  };
  assert.ok(find("NET", "one and only").some(p => p.reference === "John 3:16"));
  assert.equal(find("KJV", "one and only").length, 0);
  assert.ok(find("KJV", "only begotten").some(p => p.reference === "John 3:16"));
  assert.equal(find("NET", "only begotten").length, 0);
  assert.equal(find("NET", "...").length, 0);
  assert.equal(scriptureResultHref("John 3:16", "NET"), "/bible/John/3?version=NET#verse-16");
  assert.equal(scriptureResultHref("John 3:16", "KJV"), "/bible/John/3?version=KJV#verse-16");
});

test("filtering and pagination count all matches before returning only 20 in Bible order", () => {
  const index = indexBibleVerses(rows("KJV"));
  const matches = index.flatMap((item, i) => bibleVerseMatches(item, "god", { testament: "Old Testament", book: "All books" }) ? [i] : []);
  const first = bibleResultPage(index, matches, 1), second = bibleResultPage(index, matches, 2);
  assert.equal(first.results.length, 20);
  assert.equal(second.results.length, 20);
  assert.ok(first.total > 1000);
  assert.equal(first.total, second.total);
  assert.equal(second.page, 2);
  assert.ok(first.results[0].reference.startsWith("Genesis"));
  assert.ok(first.results.every(p => !second.results.some(next => next.reference === p.reference)));
  assert.equal(bibleResultPage(index, [], 100).page, 1);
  assert.equal(bibleResultPage(index, matches, 99999).page, first.pages);
  assert.ok(!bibleVerseMatches(index[0], "god", { testament: "New Testament", book: "Genesis" }));
});

test("complete-corpus searches have a bounded CPU cost", () => {
  const index = indexBibleVerses(rows("NET"));
  const started = performance.now();
  for (let run = 0; run < 20; run++) {
    for (const item of index) bibleVerseMatches(item, "god", { testament: "All Testaments", book: "All books" });
  }
  const perSearch = (performance.now() - started) / 20;
  console.log(`NET complete-corpus CPU search: ${perSearch.toFixed(2)} ms average on this runner`);
  assert.ok(perSearch < 250);
});

async function startWorker(failFirstShard = false) {
  const source = `
    (async () => {
      const { register } = await import("tsx/esm/api"); register();
      const { parentPort, workerData } = await import("node:worker_threads");
      const { readFile } = await import("node:fs/promises");
      globalThis.self = { postMessage: data => parentPort.postMessage(data), onmessage: null };
      let fail = workerData.failFirstShard;
      globalThis.fetch = async url => {
        const filename = String(url).split("/").pop();
        parentPort.postMessage({ trace: String(url) });
        if (fail && filename !== "manifest.json") { fail = false; return new Response("", {status:503}); }
        return new Response(await readFile(workerData.root + filename), {status:200});
      };
      await import(workerData.module);
      parentPort.on("message", data => self.onmessage({ data }));
      parentPort.postMessage({ready:true});
    })().catch(error => { console.error(error); process.exit(1); });
  `;
  const worker = new Worker(source, { eval: true, workerData: {
    root: fileURLToPath(root), module: new URL("../src/workers/bible-search.worker.ts", import.meta.url).href, failFirstShard,
  } });
  const messages: any[] = [];
  worker.on("message", message => messages.push(message));
  await new Promise<void>((resolve, reject) => {
    worker.once("error", reject);
    const listener = (message: any) => { if (message.ready) { worker.off("message", listener); resolve(); } };
    worker.on("message", listener);
  });
  const request = (id: number, version: "NET" | "KJV", query: string, extra: object = {}) => {
    worker.postMessage({ type: "search", id, version, query, testament: "All Testaments", book: "All books", page: 1, baseUrl: "/follow/", ...extra });
  };
  const result = (id: number) => new Promise<BibleSearchResponse>((resolve, reject) => {
    const timer = setTimeout(() => { worker.off("message", listener); reject(new Error(`Worker ${id} timed out`)); }, 20000);
    const listener = (message: BibleSearchResponse) => {
      if (message.id === id && message.status !== "loading") {
        clearTimeout(timer); worker.off("message", listener); resolve(message);
      }
    };
    worker.on("message", listener);
  });
  return { worker, messages, request, result };
}

test("real background worker loads only the selected version, reuses it, and discards stale searches", { timeout: 30000 }, async () => {
  const { worker, messages, request, result } = await startWorker();
  try {
    assert.equal(messages.filter(m => m.trace).length, 0);
    request(1, "NET", "one and only", { book: "John" });
    const first = await result(1);
    assert.equal(first.status, "success");
    assert.ok(first.results.some(p => p.reference === "John 3:16"));
    assert.ok(messages.filter(m => m.trace && !m.trace.endsWith("manifest.json")).every(m => m.trace.includes("/net-")));
    const requests = messages.filter(m => m.trace).length;
    request(2, "NET", "god", { book: "John", page: 2 });
    const next = await result(2);
    assert.equal(next.page, 2);
    assert.equal(messages.filter(m => m.trace).length, requests, "paging and new queries reuse cached data");
    request(3, "NET", "love");
    request(4, "KJV", "only begotten", { book: "John" });
    const switched = await result(4);
    assert.equal(switched.version, "KJV");
    assert.ok(switched.results.some(p => p.reference === "John 3:16"));
    assert.ok(!messages.some(m => m.id === 3 && m.status === "success"), "stale NET results never replace KJV");
    request(5, "KJV", "god");
    worker.postMessage({ type: "cancel", id: 6 });
    request(7, "KJV", "zzzz-no-match");
    assert.equal((await result(7)).total, 0);
    assert.ok(!messages.some(m => m.id === 5 && m.status === "success"), "cleared searches are discarded");
    console.log(`Worker NET search including cooperative yields: ${first.elapsedMs?.toFixed(2)} ms`);
  } finally { await worker.terminate(); }
});

test("background asset failures are explicit and retryable without another translation as fallback", { timeout: 30000 }, async () => {
  const { worker, messages, request, result } = await startWorker(true);
  try {
    request(1, "NET", "zimran");
    const failed = await result(1);
    assert.equal(failed.status, "error");
    assert.equal(failed.results.length, 0);
    request(2, "NET", "zimran");
    const retry = await result(2);
    assert.equal(retry.status, "success");
    assert.ok(retry.results.some(p => p.reference === "Genesis 25:2"));
    assert.ok(!messages.some(m => m.trace?.includes("/kjv-")));
  } finally { await worker.terminate(); }
});
