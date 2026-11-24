import { BIBLE_BOOKS } from "../lib/bible-order";
import {
  bibleResultPage, bibleVerseMatches, indexBibleVerses, normalizeBibleSearch,
  type BibleSearchRequest, type BibleSearchResponse, type BibleTranslation, type BibleVerse, type IndexedBibleVerse,
} from "../lib/full-bible-search";

type Shard = { file: string; sha256: string; verses: number };
type TranslationManifest = { bookCount: number; verseCount: number; shards: Shard[]; coverageNotes: string };
type Manifest = { schemaVersion: number; books: string[]; translations: Record<BibleTranslation, TranslationManifest> };
type Corpus = { index: IndexedBibleVerse[]; info: TranslationManifest };
const corpora = new Map<BibleTranslation, Promise<Corpus>>();
let manifestPromise: Promise<Manifest> | undefined;
let latestId = 0;
let lastMatches: { key: string; matches: number[] } | undefined;

async function fetchAsset(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("Bible search text could not be loaded. Please retry.");
  return response;
}

function loadCorpus(version: BibleTranslation, baseUrl: string): Promise<Corpus> {
  const existing = corpora.get(version);
  if (existing) return existing;
  const root = `${baseUrl.replace(/\/$/, "")}/knowing-god/bible-search/`;
  const pending = (async () => {
    manifestPromise ??= fetchAsset(`${root}manifest.json`).then(r => r.json()).catch(error => {
      manifestPromise = undefined;
      throw error;
    });
    const manifest = await manifestPromise;
    if (!manifest || manifest.schemaVersion !== 1 || JSON.stringify(manifest.books) !== JSON.stringify(BIBLE_BOOKS)) {
      throw new Error("Bible search manifest is invalid.");
    }
    const info = manifest.translations[version];
    if (!info || info.bookCount !== 66 || info.verseCount < 30000 || !info.shards.length) throw new Error("Bible search corpus is incomplete.");
    const chunks: BibleVerse[][] = new Array(info.shards.length);
    let next = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (next < info.shards.length) {
        const at = next++, shard = info.shards[at];
        if (!new RegExp(`^${version.toLowerCase()}-\\d{2}\\.[a-f0-9]{12}\\.json$`).test(shard.file)) throw new Error("Invalid Bible search asset.");
        const bytes = await (await fetchAsset(`${root}${shard.file}`)).arrayBuffer();
        const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map(b => b.toString(16).padStart(2, "0")).join("");
        if (hash !== shard.sha256) throw new Error("Bible search text failed its integrity check. Please retry.");
        const rows = JSON.parse(new TextDecoder().decode(bytes)) as BibleVerse[];
        if (!Array.isArray(rows) || rows.length !== shard.verses || rows.some(row =>
          !Array.isArray(row) || row.length !== 4 || !Number.isInteger(row[0]) || row[0] < 0 || row[0] > 65 ||
          !Number.isInteger(row[1]) || row[1] < 1 || !Number.isInteger(row[2]) || row[2] < 1 || typeof row[3] !== "string" || !row[3].trim()
        )) throw new Error("Bible search text is incomplete.");
        chunks[at] = rows;
      }
    }));
    const rows = chunks.flat();
    if (rows.length !== info.verseCount) throw new Error("Bible search text is incomplete.");
    return { index: indexBibleVerses(rows), info };
  })().catch(error => { corpora.delete(version); throw error; });
  corpora.set(version, pending);
  return pending;
}

function reply(request: BibleSearchRequest, response: Partial<BibleSearchResponse>) {
  if (request.id !== latestId) return;
  self.postMessage({ id: request.id, version: request.version, results: [], total: 0, page: 1, pages: 1, ...response });
}

self.onmessage = async (event: MessageEvent<BibleSearchRequest | { type: "cancel"; id: number }>) => {
  const request = event.data;
  latestId = request.id;
  if (request.type === "cancel") return;
  const query = normalizeBibleSearch(request.query);
  if (!query) { reply(request, { status: "success" }); return; }
  reply(request, { status: "loading" });
  try {
    const { index, info } = await loadCorpus(request.version, request.baseUrl);
    if (request.id !== latestId) return;
    const started = performance.now();
    const key = JSON.stringify([request.version, query, request.testament, request.book]);
    if (lastMatches?.key !== key) {
      const matches: number[] = [];
      for (let i = 0; i < index.length; i++) {
        if (bibleVerseMatches(index[i], query, request)) matches.push(i);
        if (i % 2048 === 2047) {
          await new Promise(resolve => setTimeout(resolve, 0));
          if (request.id !== latestId) return;
        }
      }
      lastMatches = { key, matches };
    }
    reply(request, {
      status: "success", ...bibleResultPage(index, lastMatches.matches, request.page),
      verseCount: info.verseCount, elapsedMs: performance.now() - started, coverageNotes: info.coverageNotes,
    });
  } catch (error) {
    reply(request, { status: "error", error: error instanceof Error ? error.message : "Bible search failed. Please retry." });
  }
};
