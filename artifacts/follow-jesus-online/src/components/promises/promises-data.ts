import { knowingGodScriptureHref } from "../knowing-god/scripture-link";

export type Block = { kind: "heading" | "paragraph" | "passage"; text: string; sourceParagraphs: number[]; reference?: string; bibleReference?: string; referenceNote?: string; translation?: string };
export type Topic = { id: string; title: string; blocks: Block[] };
export type Group = { id: string; title: string; description: string; sourceHeading: string; preamble: Block[]; topics: Topic[] };
export type Book = { title: string; sourceTitle: string; publication: Block[]; introduction: Block[]; resources: Block[]; groups: Group[]; counts: { groups: number; topics: number; passages: number } };

export const STORAGE_KEY = "promises-for-hope-saved";
export const printedTranslations = (book: Book): string[] => [...new Set([
  ...book.introduction, ...book.groups.flatMap(group => group.topics.flatMap(topic => topic.blocks)),
].flatMap(block => block.translation ? [block.translation] : []))].sort();
export const base = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`;

export const scriptureHref = (reference?: string): string | null => {
  if (!reference) return null;
  try { return knowingGodScriptureHref(reference, import.meta.env.BASE_URL); } catch { return null; }
};

export const readSaved = (): { ids: string[]; error: string } => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) throw new Error("Invalid saved study list");
    return { ids: [...new Set(raw.filter((v): v is string => typeof v === "string"))], error: "" };
  } catch { return { ids: [], error: "Your saved list could not be read in this browser. You can still read, but saving may not persist." }; }
};

export const writeSaved = (ids: string[]): string => {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); return ""; }
  catch { return "Your saved list could not be stored in this browser (storage may be full or blocked). It will be lost when you leave this page."; }
};

export const blockText = (blocks: Block[]) => blocks.map(b => b.text).join("\n\n");

const normalizeSearch = (value: string) => value.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[–—]/g, "-").toLocaleLowerCase();
export const searchTopics = (book: Book, query: string) => {
  const q = normalizeSearch(query.trim());
  if (!q) return [];
  const out: { topic: Topic; group: Group; hit: string; rank: number }[] = [];
  for (const group of book.groups) for (const topic of group.topics) {
    if (normalizeSearch(topic.title).includes(q)) { out.push({ topic, group, hit: "Title", rank: 0 }); continue; }
    const b = topic.blocks.find(x => normalizeSearch(x.reference || "").includes(q));
    if (b) { out.push({ topic, group, hit: b.reference || "Reference", rank: 1 }); continue; }
    const t = topic.blocks.find(x => normalizeSearch(x.text).includes(q));
    if (t) {
      const i = normalizeSearch(t.text).indexOf(q);
      out.push({ topic, group, hit: `…${t.text.slice(Math.max(0, i - 50), i + 90).replace(/\s+/g, " ")}…`, rank: 2 });
    }
  }
  // Keep the book's order within each tier, but surface every title hit first.
  return out.sort((a, b) => a.rank - b.rank).map(({ topic, group, hit }) => ({ topic, group, hit }));
};
