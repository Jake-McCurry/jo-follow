export const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

const bookOrder = new Map(BIBLE_BOOKS.map((book, index) => [book.toLowerCase(), index]));

function referencePosition(reference: string): number[] {
  const match = reference.trim().match(/^(.+?)\s+(\d+)(?::(\d+))?/);
  if (!match) return [BIBLE_BOOKS.length, 0, 0];
  const book = match[1].replace(/^III\s+/i, "3 ").replace(/^II\s+/i, "2 ").replace(/^I\s+/i, "1 ")
    .replace(/^Psalm$/i, "Psalms").toLowerCase();
  const singleChapter = ["obadiah", "philemon", "2 john", "3 john", "jude"].includes(book);
  return [
    bookOrder.get(book) ?? BIBLE_BOOKS.length,
    singleChapter && !match[3] ? 1 : Number(match[2]),
    Number(match[3] ?? (singleChapter ? match[2] : 0)),
  ];
}

/** Sort on the first cited verse, without altering the printed reference. */
export function compareBibleReferences(a: string, b: string): number {
  const left = referencePosition(a), right = referencePosition(b);
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}
