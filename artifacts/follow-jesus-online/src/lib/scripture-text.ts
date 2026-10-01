const BIBLE_BOOKS = [
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "1 Corinthians", "2 Corinthians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Song of Solomon", "Ecclesiastes", "Lamentations", "Deuteronomy", "Leviticus",
  "Numbers", "Philippians", "Colossians", "Ephesians", "Galatians", "Romans",
  "Hebrews", "Revelation", "Matthew", "Mark", "Luke", "John", "Acts", "Titus",
  "Philemon", "James", "Jude", "Genesis", "Exodus", "Joshua", "Judges", "Ruth",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Psalm", "Proverbs", "Isaiah",
  "Jeremiah", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah",
  "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
];

export type ScriptureTextPart = {
  text: string;
  reference?: string;
  prefix?: string;
  suffix?: string;
};

const bookPattern = [...BIBLE_BOOKS]
  .sort((a, b) => b.length - a.length)
  .map((book) => book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const versePattern = "\\d{1,3}(?:[-–—](?:\\d{1,3}:)?\\d{1,3})?";

/** Chapter mentions are ordinary text; each verse citation gets its own preview. */
export function splitScriptureText(text: string): ScriptureTextPart[] {
  const explicit = new RegExp(`\\b(${bookPattern})\\s+(\\d{1,3}):(${versePattern})`, "g");
  const shorthand = new RegExp(`^([;,]\\s*)(?:(\\d{1,3}):)?(${versePattern})(?=$|[\\s,;).!?])`);
  const parts: ScriptureTextPart[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = explicit.exec(text))) {
    if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index) });
    const book = match[1];
    let chapter = match[2];
    parts.push({ text: match[0], reference: `${book} ${chapter}:${match[3]}` });
    cursor = explicit.lastIndex;
    let short: RegExpExecArray | null;
    while ((short = shorthand.exec(text.slice(cursor)))) {
      parts.push({ text: short[1] });
      chapter = short[2] ?? chapter;
      parts.push({ text: short[0].slice(short[1].length), reference: `${book} ${chapter}:${short[3]}` });
      cursor += short[0].length;
    }
    explicit.lastIndex = cursor;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });

  // Keep punctuation/version labels attached without making multiple citations
  // into a single tooltip or one long, unbreakable line.
  for (const [index, part] of parts.entries()) {
    if (!part.reference) continue;
    const previous = parts[index - 1];
    const next = parts[index + 1];
    const opening = previous && !previous.reference ? previous.text.match(/\(\s*$/)?.[0] : undefined;
    if (opening && previous) {
      previous.text = previous.text.slice(0, -opening.length);
      part.prefix = opening;
    }
    const closing = next && !next.reference
      ? next.text.match(/^\s*(?:,\s*(?:NIV|NLT|NET|ESV|KJV|NKJV|NASB|NRSV|CSB|RSV|AMP))?\)/i)?.[0]
      : undefined;
    if (closing && next) {
      next.text = next.text.slice(closing.length);
      part.suffix = closing;
    }
  }
  return parts.filter((part) => part.reference || part.text);
}