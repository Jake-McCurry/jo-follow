/** Supplemental references open Follow's own Bible reader at the first verse.
 * The complete source citation/range remains visible in the concordance. */
export function knowingGodScriptureHref(reference: string, baseUrl = "/"): string {
  const match = reference.trim().match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+))?/);
  if (!match) throw new Error(`Invalid Knowing God Scripture reference: ${reference}`);
  const book = match[1].replace(/^Psalm$/, "Psalms");
  const singleChapter = ["Obadiah", "Philemon", "2 John", "3 John", "Jude"].includes(book);
  const chapter = singleChapter ? "1" : match[2];
  const verse = match[3] ?? (singleChapter ? match[2] : undefined);
  const prefix = baseUrl.replace(/\/$/, "");
  return `${prefix}/bible/${encodeURIComponent(book)}/${chapter}${verse ? `#verse-${verse}` : ""}`;
}