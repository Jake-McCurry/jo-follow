import assert from "node:assert/strict"
import test from "node:test"
import {
  BIBLE_STUDY_DATA_VERSION,
  getChapterKey,
  getVerseKey,
  parseImportedBibleStudyData,
  type BibleStudyData,
} from "../src/hooks/use-bible-study.ts"

const verse = {
  id: getVerseKey("John", 3, 16),
  bookName: "John",
  chapter: 3,
  verse: 16,
  text: "For God so loved the world.",
}

const chapterBookmark = {
  id: getChapterKey("John", 3),
  kind: "chapter" as const,
  bookName: "John",
  chapter: 3,
  reference: "John 3",
  savedAt: "2026-09-01T00:00:00.000Z",
}

const verseBookmark = {
  ...verse,
  kind: "verse" as const,
  reference: "John 3:16",
  savedAt: "2026-09-01T00:00:00.000Z",
}

const validBackup: BibleStudyData = {
  version: BIBLE_STUDY_DATA_VERSION,
  bookmarks: [chapterBookmark, verseBookmark],
  highlights: {
    [verse.id]: {
      ...verse,
      color: "yellow",
      updatedAt: "2026-09-01T00:00:00.000Z",
    },
  },
  notes: {
    [verse.id]: {
      ...verse,
      note: "Read this again tomorrow.",
      updatedAt: "2026-09-01T00:00:00.000Z",
    },
  },
  lastRead: {
    bookName: "John",
    chapter: 3,
    reference: "John 3",
  },
}

function backupWith(change: (backup: Record<string, unknown>) => void): string {
  const backup = JSON.parse(JSON.stringify(validBackup)) as Record<string, unknown>
  change(backup)
  return JSON.stringify(backup)
}

test("accepts a valid exported version-1 backup", () => {
  assert.deepEqual(parseImportedBibleStudyData(JSON.stringify(validBackup)), validBackup)
})

test("rejects incomplete backups", () => {
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        delete backup.notes
      }),
    ),
    null,
  )
})

test("rejects unsupported backup versions", () => {
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        backup.version = 2
      }),
    ),
    null,
  )
})

test("rejects malformed bookmarks", () => {
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        backup.bookmarks = [{ ...verseBookmark, reference: 42 }]
      }),
    ),
    null,
  )
})

test("rejects duplicate bookmark IDs", () => {
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        backup.bookmarks = [chapterBookmark, { ...chapterBookmark }]
      }),
    ),
    null,
  )
})

test("rejects invalid chapter and verse numbers", () => {
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        backup.bookmarks = [{ ...chapterBookmark, chapter: 0 }]
      }),
    ),
    null,
  )
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        backup.bookmarks = [{ ...verseBookmark, id: getVerseKey("John", 3, 0), verse: 0 }]
      }),
    ),
    null,
  )
})

test("rejects mismatched highlight and note map keys", () => {
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        backup.highlights = { "wrong-highlight-key": validBackup.highlights[verse.id] }
      }),
    ),
    null,
  )
  assert.equal(
    parseImportedBibleStudyData(
      backupWith((backup) => {
        backup.notes = { "wrong-note-key": validBackup.notes[verse.id] }
      }),
    ),
    null,
  )
})