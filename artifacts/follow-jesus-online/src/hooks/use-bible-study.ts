import { useCallback, useState } from "react"

export const BIBLE_STUDY_STORAGE_KEY = "jol_bible_study_v1"
export const BIBLE_STUDY_DATA_VERSION = 1 as const

export const HIGHLIGHT_COLORS = ["yellow", "blue", "green", "pink"] as const
export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number]

export interface StudyVerse {
  id: string
  bookName: string
  chapter: number
  verse: number
  text: string
}

export interface ChapterBookmark {
  id: string
  kind: "chapter"
  bookName: string
  chapter: number
  reference: string
  savedAt: string
}

export interface VerseBookmark extends StudyVerse {
  kind: "verse"
  reference: string
  savedAt: string
}

export interface Highlight extends StudyVerse {
  color: HighlightColor
  updatedAt: string
}

export interface VerseNote extends StudyVerse {
  note: string
  updatedAt: string
}

export interface LastRead {
  bookName: string
  chapter: number
  reference: string
}

export interface BibleStudyData {
  version: typeof BIBLE_STUDY_DATA_VERSION
  bookmarks: Array<ChapterBookmark | VerseBookmark>
  highlights: Record<string, Highlight>
  notes: Record<string, VerseNote>
  lastRead: LastRead | null
}

const EMPTY_DATA: BibleStudyData = {
  version: BIBLE_STUDY_DATA_VERSION,
  bookmarks: [],
  highlights: {},
  notes: {},
  lastRead: null,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isHighlightColor(value: unknown): value is HighlightColor {
  return typeof value === "string" && HIGHLIGHT_COLORS.includes(value as HighlightColor)
}

function isStudyVerse(value: unknown): value is StudyVerse {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.bookName === "string" &&
    value.bookName.trim().length > 0 &&
    typeof value.chapter === "number" &&
    Number.isSafeInteger(value.chapter) &&
    value.chapter > 0 &&
    typeof value.verse === "number" &&
    Number.isSafeInteger(value.verse) &&
    value.verse > 0 &&
    typeof value.text === "string"
  )
}

function normalizeData(value: unknown): BibleStudyData | null {
  if (!isRecord(value) || value.version !== BIBLE_STUDY_DATA_VERSION) return null
  if (
    !Array.isArray(value.bookmarks) ||
    !isRecord(value.highlights) ||
    !isRecord(value.notes) ||
    !("lastRead" in value)
  ) {
    return null
  }

  const bookmarks: Array<ChapterBookmark | VerseBookmark> = []
  for (const bookmark of value.bookmarks) {
    if (!isRecord(bookmark) || typeof bookmark.id !== "string" || typeof bookmark.kind !== "string") return null
    if (bookmark.kind === "chapter") {
      if (
        typeof bookmark.bookName !== "string" ||
        !bookmark.bookName.trim() ||
        typeof bookmark.chapter !== "number" ||
        !Number.isSafeInteger(bookmark.chapter) ||
        bookmark.chapter < 1 ||
        bookmark.id !== getChapterKey(bookmark.bookName, bookmark.chapter) ||
        typeof bookmark.reference !== "string" ||
        typeof bookmark.savedAt !== "string"
      ) {
        return null
      }
      bookmarks.push({
        id: bookmark.id,
        kind: "chapter",
        bookName: bookmark.bookName,
        chapter: bookmark.chapter,
        reference: bookmark.reference,
        savedAt: bookmark.savedAt,
      })
      continue
    }

    if (
      bookmark.kind !== "verse" ||
      !isStudyVerse(bookmark) ||
      bookmark.id !== getVerseKey(bookmark.bookName, bookmark.chapter, bookmark.verse) ||
      typeof bookmark.reference !== "string" ||
      typeof bookmark.savedAt !== "string"
    ) {
      return null
    }
    bookmarks.push({
      ...bookmark,
      kind: "verse",
      reference: bookmark.reference,
      savedAt: bookmark.savedAt,
    })
  }

  if (new Set(bookmarks.map((bookmark) => bookmark.id)).size !== bookmarks.length) return null

  const highlights: Record<string, Highlight> = {}
  for (const [id, highlight] of Object.entries(value.highlights)) {
    if (
      !isRecord(highlight) ||
      !isStudyVerse(highlight) ||
      id !== highlight.id ||
      id !== getVerseKey(highlight.bookName, highlight.chapter, highlight.verse) ||
      !isHighlightColor(highlight.color) ||
      typeof highlight.updatedAt !== "string"
    ) {
      return null
    }
    highlights[id] = { ...highlight, color: highlight.color, updatedAt: highlight.updatedAt }
  }

  const notes: Record<string, VerseNote> = {}
  for (const [id, note] of Object.entries(value.notes)) {
    if (
      !isRecord(note) ||
      !isStudyVerse(note) ||
      id !== note.id ||
      id !== getVerseKey(note.bookName, note.chapter, note.verse) ||
      typeof note.note !== "string" ||
      !note.note.trim() ||
      typeof note.updatedAt !== "string"
    ) {
      return null
    }
    notes[id] = { ...note, note: note.note, updatedAt: note.updatedAt }
  }

  let lastRead: LastRead | null = null
  if (value.lastRead !== null) {
    if (
      !isRecord(value.lastRead) ||
      typeof value.lastRead.bookName !== "string" ||
      !value.lastRead.bookName.trim() ||
      typeof value.lastRead.chapter !== "number" ||
      !Number.isSafeInteger(value.lastRead.chapter) ||
      value.lastRead.chapter < 1 ||
      typeof value.lastRead.reference !== "string"
    ) {
      return null
    }
    lastRead = {
      bookName: value.lastRead.bookName,
      chapter: value.lastRead.chapter,
      reference: value.lastRead.reference,
    }
  }

  return {
    version: BIBLE_STUDY_DATA_VERSION,
    bookmarks,
    highlights,
    notes,
    lastRead,
  }
}

function cloneEmptyData(): BibleStudyData {
  return {
    version: EMPTY_DATA.version,
    bookmarks: [],
    highlights: {},
    notes: {},
    lastRead: null,
  }
}

function readStoredData(): { data: BibleStudyData; storageAvailable: boolean } {
  try {
    const raw = window.localStorage.getItem(BIBLE_STUDY_STORAGE_KEY)
    if (!raw) return { data: cloneEmptyData(), storageAvailable: true }
    return { data: normalizeData(JSON.parse(raw)) ?? cloneEmptyData(), storageAvailable: true }
  } catch {
    return { data: cloneEmptyData(), storageAvailable: false }
  }
}

export function getVerseKey(bookName: string, chapter: number, verse: number) {
  return `${bookName.trim().toLowerCase()}|${chapter}|${verse}`
}

export function getChapterKey(bookName: string, chapter: number) {
  return `chapter|${bookName.trim().toLowerCase()}|${chapter}`
}

export function getVerseReference(verse: Pick<StudyVerse, "bookName" | "chapter" | "verse">) {
  return `${verse.bookName} ${verse.chapter}:${verse.verse}`
}

export function parseImportedBibleStudyData(raw: string): BibleStudyData | null {
  try {
    return normalizeData(JSON.parse(raw))
  } catch {
    return null
  }
}

function mergeData(current: BibleStudyData, incoming: BibleStudyData): BibleStudyData {
  const bookmarks = [...current.bookmarks]
  incoming.bookmarks.forEach((bookmark) => {
    if (!bookmarks.some((existing) => existing.id === bookmark.id)) bookmarks.push(bookmark)
  })

  return {
    version: BIBLE_STUDY_DATA_VERSION,
    bookmarks,
    highlights: { ...current.highlights, ...incoming.highlights },
    notes: { ...current.notes, ...incoming.notes },
    lastRead: incoming.lastRead ?? current.lastRead,
  }
}

export function useBibleStudy() {
  const [{ data, storageAvailable }, setStoredState] = useState(readStoredData)

  const persist = useCallback((nextData: BibleStudyData) => {
    try {
      window.localStorage.setItem(BIBLE_STUDY_STORAGE_KEY, JSON.stringify(nextData))
      setStoredState({ data: nextData, storageAvailable: true })
    } catch {
      setStoredState({ data: nextData, storageAvailable: false })
    }
  }, [])

  const update = useCallback(
    (updater: (current: BibleStudyData) => BibleStudyData) => {
      setStoredState((current) => {
        const nextData = updater(current.data)
        try {
          window.localStorage.setItem(BIBLE_STUDY_STORAGE_KEY, JSON.stringify(nextData))
          return { data: nextData, storageAvailable: true }
        } catch {
          return { data: nextData, storageAvailable: false }
        }
      })
    },
    [],
  )

  const toggleChapterBookmark = useCallback((bookmark: Omit<ChapterBookmark, "id" | "kind" | "savedAt">) => {
    update((current) => {
      const id = getChapterKey(bookmark.bookName, bookmark.chapter)
      const alreadySaved = current.bookmarks.some((item) => item.id === id)
      return {
        ...current,
        bookmarks: alreadySaved
          ? current.bookmarks.filter((item) => item.id !== id)
          : [...current.bookmarks, { ...bookmark, id, kind: "chapter", savedAt: new Date().toISOString() }],
      }
    })
  }, [update])

  const toggleVerseBookmark = useCallback((verse: StudyVerse) => {
    update((current) => {
      const alreadySaved = current.bookmarks.some((item) => item.id === verse.id)
      return {
        ...current,
        bookmarks: alreadySaved
          ? current.bookmarks.filter((item) => item.id !== verse.id)
          : [
              ...current.bookmarks,
              {
                ...verse,
                kind: "verse",
                reference: getVerseReference(verse),
                savedAt: new Date().toISOString(),
              },
            ],
      }
    })
  }, [update])

  const setHighlight = useCallback((verse: StudyVerse, color: HighlightColor | null) => {
    update((current) => {
      const highlights = { ...current.highlights }
      if (color) {
        highlights[verse.id] = { ...verse, color, updatedAt: new Date().toISOString() }
      } else {
        delete highlights[verse.id]
      }
      return { ...current, highlights }
    })
  }, [update])

  const setNote = useCallback((verse: StudyVerse, note: string) => {
    update((current) => {
      const notes = { ...current.notes }
      if (note.trim()) {
        notes[verse.id] = { ...verse, note: note.trim(), updatedAt: new Date().toISOString() }
      } else {
        delete notes[verse.id]
      }
      return { ...current, notes }
    })
  }, [update])

  const removeBookmark = useCallback((id: string) => {
    update((current) => ({ ...current, bookmarks: current.bookmarks.filter((bookmark) => bookmark.id !== id) }))
  }, [update])

  const removeHighlight = useCallback((id: string) => {
    update((current) => {
      const highlights = { ...current.highlights }
      delete highlights[id]
      return { ...current, highlights }
    })
  }, [update])

  const removeNote = useCallback((id: string) => {
    update((current) => {
      const notes = { ...current.notes }
      delete notes[id]
      return { ...current, notes }
    })
  }, [update])

  const setLastRead = useCallback((lastRead: LastRead) => {
    update((current) => ({ ...current, lastRead }))
  }, [update])

  const importData = useCallback((incoming: BibleStudyData) => {
    update((current) => mergeData(current, incoming))
  }, [update])

  const replaceData = useCallback((incoming: BibleStudyData) => {
    persist(incoming)
  }, [persist])

  return {
    data,
    storageAvailable,
    toggleChapterBookmark,
    toggleVerseBookmark,
    setHighlight,
    setNote,
    removeBookmark,
    removeHighlight,
    removeNote,
    setLastRead,
    importData,
    replaceData,
  }
}