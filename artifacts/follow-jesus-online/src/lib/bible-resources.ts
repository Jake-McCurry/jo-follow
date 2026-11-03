import { useQuery } from "@tanstack/react-query";
import { splitScriptureText } from "@/lib/scripture-text";
import verseBounds from "@/data/bible-verse-counts.json";

export type ResourceItem = {
  id: string;
  title: string;
  path: string | null;
  sourceUrl: string | null;
  pdfSourceUrl?: string | null;
  status: "imported" | "missing-source" | "blocked" | "coming-soon";
  issue?: string;
  pdfPath?: string;
};
export type ResourceCollection = {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  path: string;
  items: ResourceItem[];
};
export type ResourceCatalog = { schemaVersion: 1; collections: ResourceCollection[]; issues: unknown[] };
export type ResourceArticle = {
  id: string;
  title: string;
  listTitle: string;
  collectionId: string;
  path: string;
  sourceUrl: string;
  markdown: string;
  sourceMarkdown: string;
  sourceSha256: string;
  contentSha256: string;
  issues: string[];
  pdf: { sourceUrl: string; status: "available" | "blocked" | "unavailable"; path?: string };
};

const base = (import.meta.env?.BASE_URL ?? "/").replace(/\/$/, "");
export const assetUrl = (path: string) => `${base}${path.startsWith("/") ? path : `/${path}`}`;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(assetUrl(path), { credentials: "include" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export function useResourceCatalog() {
  return useQuery({
    queryKey: ["bible-resources", "catalog"],
    queryFn: async () => {
      const data = await getJson<ResourceCatalog>("/bible-resources/catalog.json");
      if (data?.schemaVersion !== 1 || !Array.isArray(data.collections)) throw new Error("Invalid resource catalog");
      return data;
    },
    staleTime: Infinity,
  });
}

export function useResourceArticle(id: string | undefined) {
  return useQuery({
    queryKey: ["bible-resources", "article", id],
    enabled: !!id,
    queryFn: () => getJson<ResourceArticle>(`/bible-resources/articles/${encodeURIComponent(id!)}.json`),
    staleTime: Infinity,
  });
}

/** Normalise an Equip URL so catalog lookups ignore protocol, www, trailing slash, query and hash. */
export function normalizeSourceUrl(url: string): string {
  try {
    const u = new URL(url, "https://equip.jesusonline.com");
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function isEquipUrl(url: string): boolean {
  try {
    return /(^|\.)equip\.jesusonline\.com$/i.test(new URL(url, "https://x.invalid").hostname);
  } catch {
    return false;
  }
}

export function buildLinkMap(catalog: ResourceCatalog | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!catalog) return map;
  for (const c of catalog.collections) {
    if (c.sourceUrl) map.set(normalizeSourceUrl(c.sourceUrl), c.path);
    for (const item of c.items) {
      if (item.sourceUrl && item.path && item.status === "imported") map.set(normalizeSourceUrl(item.sourceUrl), item.path);
    }
  }
  // Source body links to these already-inventoried collections/resources must
  // not send readers to the JO App to obtain the imported content.
  map.set(normalizeSourceUrl("https://app.jesusonline.com/post/68001-hearing-the-voice-of-god"), "/bible/resources/hearing-god");
  const character = catalog.collections.find(c => c.id === "promises-collection")?.items
    .find(item => item.sourceUrl?.endsWith("/promises-about-gods-authority"));
  if (character?.path && character.status === "imported") {
    map.set(normalizeSourceUrl("https://app.jesusonline.com/post/23258-promises-about-gods-character"), character.path);
  }
  map.set(normalizeSourceUrl("https://jesusonline.com/pdf_c/jom/Gods_Promises_for_a_new_year.pdf"),
    "/bible-resources/pdfs/gods-promises-for-a-new-year.pdf");
  return map;
}

export const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

/** Only an exact canonical book title (survey lessons) supplies context for bare chapter:verse references. */
export function canonicalBookFromTitle(title: string, collectionId: string): string | null {
  if (!collectionId.startsWith("survey")) return null;
  const t = title.trim().replace(/\s+/g, " ").toLowerCase();
  const alias: Record<string, string> = { psalm: "Psalms", "song of songs": "Song of Solomon" };
  return BIBLE_BOOKS.find((b) => b.toLowerCase() === t) ?? alias[t] ?? null;
}

export type ParsedRef = { book: string; startChapter: number; startVerse: number; endChapter: number; endVerse: number };

export function parseRef(book: string, ref: string): ParsedRef | null {
  const m = ref.replace(/[–—]/g, "-").trim().match(/^(\d{1,3}):(\d{1,3})(?:-(?:(\d{1,3}):)?(\d{1,3}))?$/);
  if (!m) return null;
  const sc = +m[1], sv = +m[2];
  const ec = m[3] ? +m[3] : sc;
  const ev = m[4] ? +m[4] : sv;
  if (!sc || !sv || ec < sc || (ec === sc && ev < sv)) return null;
  const chapters = verseBounds.counts[BIBLE_BOOKS.indexOf(book)];
  if (!chapters || !chapters[sc - 1] || !chapters[ec - 1] ||
      sv > chapters[sc - 1] || ev > chapters[ec - 1]) return null;
  return { book, startChapter: sc, startVerse: sv, endChapter: ec, endVerse: ev };
}

export function refLabel(r: ParsedRef): string {
  const end = r.endChapter !== r.startChapter ? `-${r.endChapter}:${r.endVerse}` : r.endVerse !== r.startVerse ? `-${r.endVerse}` : "";
  return `${r.book} ${r.startChapter}:${r.startVerse}${end}`;
}

export function readerHref(r: ParsedRef): string {
  const verses = r.endChapter === r.startChapter
    ? Array.from({ length: r.endVerse - r.startVerse + 1 }, (_, i) => r.startVerse + i).join(",")
    : String(r.startVerse);
  return assetUrl(`/bible/${encodeURIComponent(r.book)}/${r.startChapter}#verses-${verses}`);
}

export type RefPart = { text: string; ref?: ParsedRef; prefix?: string; suffix?: string };

const bookAlias = (b: string) => (b === "Psalm" ? "Psalms" : b);

/** Split text into plain parts and reliably identified references. Ambiguous text stays plain. */
export function splitRefs(text: string, contextBook: string | null): RefPart[] {
  const out: RefPart[] = [];
  const parts = splitScriptureText(text);
  for (const [index, part] of parts.entries()) {
    if (part.reference) {
      const m = part.reference.match(/^(.+?)\s+(\d{1,3}:.+)$/);
      // A malformed citation such as Genesis 25:7:7-10 must not become a
      // plausible but incorrect link to Genesis 25:7.
      const malformedTail = /^:\d/.test(parts[index + 1]?.text ?? "");
      const parsed = m && !malformedTail ? parseRef(bookAlias(m[1]), m[2]) : null;
      if (parsed) out.push({ text: part.text, ref: parsed, prefix: part.prefix, suffix: part.suffix });
      else out.push({ text: `${part.prefix ?? ""}${part.text}${part.suffix ?? ""}` });
      continue;
    }
    if (!contextBook) { out.push({ text: part.text }); continue; }
    const bare = /\((\d{1,3}:\d{1,3}(?:\s*[-–—]\s*(?:\d{1,3}:)?\d{1,3})?)\)/g;
    let cursor = 0;
    let m: RegExpExecArray | null;
    while ((m = bare.exec(part.text))) {
      const parsed = parseRef(contextBook, m[1].replace(/\s/g, ""));
      if (!parsed) continue;
      if (m.index > cursor) out.push({ text: part.text.slice(cursor, m.index) });
      out.push({ text: m[1], ref: parsed, prefix: "(", suffix: ")" });
      cursor = m.index + m[0].length;
    }
    if (cursor < part.text.length) out.push({ text: part.text.slice(cursor) });
  }
  return out;
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
/** Display-only: "Chapters One–Five" → "Chapters 1-5". The stored markdown is untouched. */
export function numericChapters(text: string): string {
  const word = (w: string) => { const i = NUMBER_WORDS.indexOf(w.toLowerCase()); return i > 0 ? String(i) : w; };
  return text.replace(/\b(Chapters?)\s+([A-Za-z]+|\d+)(\s*(?:[-–—]|through|to)\s*)([A-Za-z]+|\d+)\b/g,
    (all, label, a, _sep, b) => {
      const x = word(a), y = word(b);
      return /^\d+$/.test(x) && /^\d+$/.test(y) ? `${label} ${x}-${y}` : all;
    }).replace(/\b(Chapter)\s+([A-Za-z]+)\b/g, (all, label, a) => { const x = word(a); return /^\d+$/.test(x) ? `${label} ${x}` : all; });
}

const OUTLINE = /^(?:[IVX]{1,5}|[A-H])\.\s+\S/;
/**
 * Heading style only (display layer; stored markdown is untouched).
 * Promotes high-confidence standalone outline paragraphs ("A. Chapters one through five. Creation to Noah",
 * "B. Chapter One.") to headings. A long discussion paragraph is split at its first sentence boundary:
 * the heading keeps the outline label, the instruction follows as its own paragraph, all words in order.
 */
export function preprocessSurveyMarkdown(md: string): string {
  return md.split(/\n{2,}/).map((block) => {
    const t = block.trim();
    if (t.includes("\n")) return block;
    const stripped = t.replace(/^\*\*(.+)\*\*$/, "$1").replace(/^__(.+)__$/, "$1");
    if (!OUTLINE.test(stripped)) return block;
    const body = stripped.replace(/^\S+\s+/, "");
    if (isDiscussionHeading(body.split(/(?<=[.?!:])\s+/)[0] ?? "")) {
      const m = stripped.match(/^(\S+\s+[^.?!:]+[.?!:])\s+([\s\S]+)$/);
      return m ? `## ${m[1]}\n\n${m[2]}` : `## ${stripped}`;
    }
    const words = body.split(/\s+/).length;
    if (words <= 10 && !/[“”"]/.test(body)) return `## ${stripped}`;
    return block;
  }).join("\n\n");
}

export const isDiscussionHeading = (text: string) => /\b(discussion|application|questions? for (?:discussion|reflection)|reflection)\b/i.test(text);
export const stripOutline = (text: string) => text.replace(/^(?:[IVX]{1,5}|[A-H]|\d{1,2})[.)]\s+/, "");
export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "section";
