import { BIBLE_BOOKS } from "./bible-order";

export type BibleTranslation = "NET" | "KJV";
export type BibleVerse = [book: number, chapter: number, verse: number, text: string];
export type IndexedBibleVerse = { row: BibleVerse; normalized: string };
export type BibleSearchResult = { reference: string; text: string };
export type BibleFilters = { testament: string; book: string };
export const BIBLE_SEARCH_PAGE_SIZE = 20;

export function normalizeBibleSearch(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

export function indexBibleVerses(rows: BibleVerse[]): IndexedBibleVerse[] {
  return rows.map(row => ({ row, normalized: normalizeBibleSearch(row[3]) }));
}

export function bibleVerseMatches(item: IndexedBibleVerse, normalizedQuery: string, filters: BibleFilters): boolean {
  if (!normalizedQuery) return false;
  const bookIndex = item.row[0];
  return (filters.book === "All books" || BIBLE_BOOKS[bookIndex] === filters.book) &&
    (filters.testament === "All Testaments" || (bookIndex < 39 ? "Old Testament" : "New Testament") === filters.testament) &&
    item.normalized.includes(normalizedQuery);
}

/** Input is already canonically ordered; slice only after counting all matches. */
export function bibleResultPage(index: IndexedBibleVerse[], matches: number[], page: number) {
  const pages = Math.max(1, Math.ceil(matches.length / BIBLE_SEARCH_PAGE_SIZE));
  const currentPage = Math.min(pages, Math.max(1, Math.floor(page) || 1));
  const results: BibleSearchResult[] = matches
    .slice((currentPage - 1) * BIBLE_SEARCH_PAGE_SIZE, currentPage * BIBLE_SEARCH_PAGE_SIZE)
    .map(i => {
      const [book, chapter, verse, text] = index[i].row;
      return { reference: `${BIBLE_BOOKS[book]} ${chapter}:${verse}`, text };
    });
  return { results, total: matches.length, page: currentPage, pages };
}

export type BibleSearchRequest = {
  type: "search"; id: number; version: BibleTranslation; query: string; page: number; baseUrl: string;
} & BibleFilters;
export type BibleSearchResponse = {
  id: number; version: BibleTranslation; status: "loading" | "success" | "error";
  results: BibleSearchResult[]; total: number; page: number; pages: number;
  verseCount?: number; elapsedMs?: number; error?: string; coverageNotes?: string;
};
