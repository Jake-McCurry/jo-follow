type NetBibleApiVerse = {
  bookname?: unknown;
  chapter?: unknown;
  verse?: unknown;
  text?: unknown;
  type?: unknown;
};

export type BibleBook = {
  id: string;
  name: string;
  testament: "Old Testament" | "New Testament";
  chapters: number;
};

export type BiblePassage = {
  reference: string;
  version: string;
  verses: Array<{
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
    type?: string;
  }>;
  copyright: string;
};

const NET_BIBLE_API_URL = "https://labs.bible.org/api/";
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = 150;
const REFERENCE_PATTERN = /^[A-Za-z0-9\s:;,\-]+$/;

const passageCache = new Map<string, { expiresAt: number; data: BiblePassage }>();

export const NET_COPYRIGHT =
  "Scripture quoted by permission. Quotations designated (NET) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. http://netbible.com All rights reserved.";

export const BIBLE_BOOKS: BibleBook[] = [
  ["genesis", "Genesis", "Old Testament", 50],
  ["exodus", "Exodus", "Old Testament", 40],
  ["leviticus", "Leviticus", "Old Testament", 27],
  ["numbers", "Numbers", "Old Testament", 36],
  ["deuteronomy", "Deuteronomy", "Old Testament", 34],
  ["joshua", "Joshua", "Old Testament", 24],
  ["judges", "Judges", "Old Testament", 21],
  ["ruth", "Ruth", "Old Testament", 4],
  ["1-samuel", "1 Samuel", "Old Testament", 31],
  ["2-samuel", "2 Samuel", "Old Testament", 24],
  ["1-kings", "1 Kings", "Old Testament", 22],
  ["2-kings", "2 Kings", "Old Testament", 25],
  ["1-chronicles", "1 Chronicles", "Old Testament", 29],
  ["2-chronicles", "2 Chronicles", "Old Testament", 36],
  ["ezra", "Ezra", "Old Testament", 10],
  ["nehemiah", "Nehemiah", "Old Testament", 13],
  ["esther", "Esther", "Old Testament", 10],
  ["job", "Job", "Old Testament", 42],
  ["psalms", "Psalms", "Old Testament", 150],
  ["proverbs", "Proverbs", "Old Testament", 31],
  ["ecclesiastes", "Ecclesiastes", "Old Testament", 12],
  ["song-of-solomon", "Song of Solomon", "Old Testament", 8],
  ["isaiah", "Isaiah", "Old Testament", 66],
  ["jeremiah", "Jeremiah", "Old Testament", 52],
  ["lamentations", "Lamentations", "Old Testament", 5],
  ["ezekiel", "Ezekiel", "Old Testament", 48],
  ["daniel", "Daniel", "Old Testament", 12],
  ["hosea", "Hosea", "Old Testament", 14],
  ["joel", "Joel", "Old Testament", 3],
  ["amos", "Amos", "Old Testament", 9],
  ["obadiah", "Obadiah", "Old Testament", 1],
  ["jonah", "Jonah", "Old Testament", 4],
  ["micah", "Micah", "Old Testament", 7],
  ["nahum", "Nahum", "Old Testament", 3],
  ["habakkuk", "Habakkuk", "Old Testament", 3],
  ["zephaniah", "Zephaniah", "Old Testament", 3],
  ["haggai", "Haggai", "Old Testament", 2],
  ["zechariah", "Zechariah", "Old Testament", 14],
  ["malachi", "Malachi", "Old Testament", 4],
  ["matthew", "Matthew", "New Testament", 28],
  ["mark", "Mark", "New Testament", 16],
  ["luke", "Luke", "New Testament", 24],
  ["john", "John", "New Testament", 21],
  ["acts", "Acts", "New Testament", 28],
  ["romans", "Romans", "New Testament", 16],
  ["1-corinthians", "1 Corinthians", "New Testament", 16],
  ["2-corinthians", "2 Corinthians", "New Testament", 13],
  ["galatians", "Galatians", "New Testament", 6],
  ["ephesians", "Ephesians", "New Testament", 6],
  ["philippians", "Philippians", "New Testament", 4],
  ["colossians", "Colossians", "New Testament", 4],
  ["1-thessalonians", "1 Thessalonians", "New Testament", 5],
  ["2-thessalonians", "2 Thessalonians", "New Testament", 3],
  ["1-timothy", "1 Timothy", "New Testament", 6],
  ["2-timothy", "2 Timothy", "New Testament", 4],
  ["titus", "Titus", "New Testament", 3],
  ["philemon", "Philemon", "New Testament", 1],
  ["hebrews", "Hebrews", "New Testament", 13],
  ["james", "James", "New Testament", 5],
  ["1-peter", "1 Peter", "New Testament", 5],
  ["2-peter", "2 Peter", "New Testament", 3],
  ["1-john", "1 John", "New Testament", 5],
  ["2-john", "2 John", "New Testament", 1],
  ["3-john", "3 John", "New Testament", 1],
  ["jude", "Jude", "New Testament", 1],
  ["revelation", "Revelation", "New Testament", 22],
].map(([id, name, testament, chapters]) => ({
  id: id as string,
  name: name as string,
  testament: testament as BibleBook["testament"],
  chapters: chapters as number,
}));

function normalizeReference(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isSafeBibleReference(value: string): boolean {
  const reference = normalizeReference(value);
  return (
    reference.length > 0 &&
    reference.length <= 100 &&
    REFERENCE_PATTERN.test(reference) &&
    /[A-Za-z]/.test(reference)
  );
}

function parseVerse(value: NetBibleApiVerse): BiblePassage["verses"][number] | null {
  const chapter = Number(value.chapter);
  const verse = Number(value.verse);

  if (
    typeof value.bookname !== "string" ||
    typeof value.text !== "string" ||
    !Number.isSafeInteger(chapter) ||
    !Number.isSafeInteger(verse) ||
    chapter < 1 ||
    verse < 1
  ) {
    return null;
  }

  return {
    bookName: value.bookname,
    chapter,
    verse,
    text: value.text.replace(/\s+/g, " ").trim(),
    ...(typeof value.type === "string" ? { type: value.type } : {}),
  };
}

function evictExpiredCacheEntries(now: number): void {
  for (const [key, entry] of passageCache) {
    if (entry.expiresAt <= now) passageCache.delete(key);
  }
  while (passageCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = passageCache.keys().next().value;
    if (!oldestKey) break;
    passageCache.delete(oldestKey);
  }
}

export class BibleServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 404 | 502,
  ) {
    super(message);
  }
}

export async function getNetBiblePassage(referenceInput: string): Promise<BiblePassage> {
  const reference = normalizeReference(referenceInput);
  const cacheKey = reference.toLowerCase();
  const now = Date.now();
  const cached = passageCache.get(cacheKey);

  if (cached && cached.expiresAt > now) return cached.data;

  const url = new URL(NET_BIBLE_API_URL);
  url.searchParams.set("passage", reference);
  url.searchParams.set("formatting", "plain");
  url.searchParams.set("type", "json");

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  } catch {
    throw new BibleServiceError("The Bible service is temporarily unavailable.", 502);
  }

  if (!response.ok) {
    throw new BibleServiceError("The Bible service is temporarily unavailable.", 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new BibleServiceError("The Bible service returned an unreadable response.", 502);
  }

  if (!Array.isArray(payload)) {
    throw new BibleServiceError("The Bible service returned an unexpected response.", 502);
  }

  const verses = payload
    .filter((item): item is NetBibleApiVerse => typeof item === "object" && item !== null)
    .map(parseVerse)
    .filter((verse): verse is NonNullable<typeof verse> => verse !== null);

  if (verses.length === 0) {
    throw new BibleServiceError("No Scripture passage was found for that reference.", 404);
  }

  const data: BiblePassage = {
    reference,
    version: "NET",
    verses,
    copyright: NET_COPYRIGHT,
  };

  evictExpiredCacheEntries(now);
  passageCache.set(cacheKey, { expiresAt: now + CACHE_TTL_MS, data });

  return data;
}