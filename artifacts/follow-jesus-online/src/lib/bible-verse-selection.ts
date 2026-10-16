import type { BibleStudyData, HighlightColor, StudyVerse } from "@/hooks/use-bible-study";

export function toggleSelectedVerse(verses: StudyVerse[], verse: StudyVerse): StudyVerse[] {
  return (verses.some(item => item.id === verse.id)
    ? verses.filter(item => item.id !== verse.id)
    : [...verses, verse]).sort((a, b) => a.verse - b.verse);
}

export function selectionReference(verses: StudyVerse[]): string {
  if (!verses.length) return "";
  const ordered = [...verses].sort((a, b) => a.verse - b.verse);
  const ranges: string[] = [];
  let start = ordered[0].verse, end = start;
  const append = () => ranges.push(start === end ? `${start}` : `${start}–${end}`);
  for (const verse of ordered.slice(1)) {
    if (verse.verse === end + 1) end = verse.verse;
    else { append(); start = end = verse.verse; }
  }
  append();
  return `${ordered[0].bookName} ${ordered[0].chapter}:${ranges.join(", ")}`;
}

export function toggleSelectedBookmarks(data: BibleStudyData, verses: StudyVerse[]): BibleStudyData {
  const ids = new Set(verses.map(verse => verse.id));
  const allSaved = verses.length > 0 && verses.every(verse => data.bookmarks.some(item => item.id === verse.id));
  return {
    ...data,
    bookmarks: allSaved ? data.bookmarks.filter(item => !ids.has(item.id)) : [
      ...data.bookmarks,
      ...verses.filter(verse => !data.bookmarks.some(item => item.id === verse.id)).map(verse => ({
        ...verse, kind: "verse" as const, reference: `${verse.bookName} ${verse.chapter}:${verse.verse}`, savedAt: new Date().toISOString(),
      })),
    ],
  };
}

export function highlightSelectedVerses(data: BibleStudyData, verses: StudyVerse[], color: HighlightColor | null): BibleStudyData {
  const highlights = { ...data.highlights };
  for (const verse of verses) {
    if (color) highlights[verse.id] = { ...verse, color, updatedAt: new Date().toISOString() };
    else delete highlights[verse.id];
  }
  return { ...data, highlights };
}
