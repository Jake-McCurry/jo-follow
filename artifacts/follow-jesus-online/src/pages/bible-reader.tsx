import { useRoute, useLocation } from "wouter"
import { Layout } from "@/components/layout"
import { useListBibleBooks, useGetBiblePassage, getGetBiblePassageQueryKey } from "@workspace/api-client-react"
import { SelectNative } from "@/components/ui/select-native"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Search } from "lucide-react"
import { useState, useMemo, useEffect, FormEvent } from "react"
import { useTrackRecentPage } from "@/hooks/use-recent-page"
import { BibleStudyTools } from "@/components/bible-study-tools"
import { BibleRecap } from "@/components/bible-recap"
import { getVerseKey, type HighlightColor, type StudyVerse, useBibleStudy } from "@/hooks/use-bible-study"
import { cn } from "@/lib/utils"

const verseHighlightClasses: Record<HighlightColor, string> = {
  yellow: "bg-amber-200/80",
  blue: "bg-sky-200/80",
  green: "bg-emerald-200/80",
  pink: "bg-pink-200/80",
}

export function BibleReaderPage() {
  useTrackRecentPage();
  const [match, params] = useRoute("/bible/:book/:chapter")
  const [, setLocation] = useLocation()
  const [selectedVerse, setSelectedVerse] = useState<StudyVerse | null>(null)
  const study = useBibleStudy()
  
  let bookParam = "John"
  try {
    bookParam = decodeURIComponent(params?.book || "John")
  } catch {
    bookParam = "John"
  }
  const parsedChapter = Number.parseInt(params?.chapter || "3", 10)
  const chapterParam = Number.isSafeInteger(parsedChapter) && parsedChapter > 0 ? parsedChapter : 3

  const { data: books, isLoading: isBooksLoading } = useListBibleBooks()
  
  const passageQuery = `${bookParam} ${chapterParam}`
  const { data: passage, isLoading: isPassageLoading, error: passageError } = useGetBiblePassage(
    { passage: passageQuery },
    { query: { enabled: match && !!bookParam && !!chapterParam, queryKey: getGetBiblePassageQueryKey({ passage: passageQuery }) } }
  )

  const currentBook = useMemo(() => {
    return books?.find(b => b.name.toLowerCase() === bookParam.toLowerCase())
  }, [books, bookParam])

  const canonicalBookName = currentBook?.name || bookParam

  useEffect(() => {
    if (!isBooksLoading && books && !currentBook) {
      setLocation("/bible/John/3", { replace: true })
    }
  }, [books, currentBook, isBooksLoading, setLocation])

  useEffect(() => {
    setSelectedVerse(null)
  }, [bookParam, chapterParam])

  useEffect(() => {
    if (!match) return
    study.setLastRead({
      bookName: canonicalBookName,
      chapter: chapterParam,
      reference: passage?.reference || `${canonicalBookName} ${chapterParam}`,
    })
  }, [canonicalBookName, chapterParam, match, passage?.reference, study.setLastRead])

  useEffect(() => {
    if (!passage || !window.location.hash.startsWith("#verse-")) return
    const verseNumber = Number.parseInt(window.location.hash.replace("#verse-", ""), 10)
    if (!Number.isSafeInteger(verseNumber)) return

    const verse = passage.verses.find((item) => item.verse === verseNumber)
    if (!verse) return

    const studyVerse: StudyVerse = {
      id: getVerseKey(verse.bookName, verse.chapter, verse.verse),
      bookName: verse.bookName,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
    }
    setSelectedVerse(studyVerse)
    window.requestAnimationFrame(() => {
      document.getElementById(`verse-${verseNumber}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }, [passage])

  // Search state
  const [searchInput, setSearchInput] = useState("")

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    
    // Parse input to jump to book and chapter
    const str = searchInput.trim()
    const match = str.match(/^((?:[1-3]\s+)?[A-Za-z\s]+)\s+(\d+)(?:\s*:\s*\d+(?:-\d+)?)?$/)
    
    if (match) {
      const b = match[1].trim()
      const c = match[2].trim()
      setLocation(`/bible/${encodeURIComponent(b)}/${c}`)
      setSearchInput("")
    } else {
      // Fallback: assume they just typed a book name
      const fallbackMatch = str.match(/^((?:[1-3]\s+)?[A-Za-z\s]+)$/)
      if (fallbackMatch) {
        setLocation(`/bible/${encodeURIComponent(fallbackMatch[1].trim())}/1`)
        setSearchInput("")
      }
    }
  }

  // Navigation handlers
  const goToNextChapter = () => {
    if (!currentBook || !books) return
    if (chapterParam < currentBook.chapters) {
      setLocation(`/bible/${encodeURIComponent(currentBook.name)}/${chapterParam + 1}`)
    } else {
      const bookIndex = books.findIndex(b => b.id === currentBook.id)
      if (bookIndex !== -1 && bookIndex < books.length - 1) {
        const nextBook = books[bookIndex + 1]
        setLocation(`/bible/${encodeURIComponent(nextBook.name)}/1`)
      }
    }
  }

  const goToPrevChapter = () => {
    if (!currentBook || !books) return
    if (chapterParam > 1) {
      setLocation(`/bible/${encodeURIComponent(currentBook.name)}/${chapterParam - 1}`)
    } else {
      const bookIndex = books.findIndex(b => b.id === currentBook.id)
      if (bookIndex > 0) {
        const prevBook = books[bookIndex - 1]
        setLocation(`/bible/${encodeURIComponent(prevBook.name)}/${prevBook.chapters}`)
      }
    }
  }

  const chapterOptions = Array.from({ length: currentBook?.chapters || 1 }, (_, i) => i + 1)

  return (
    <Layout>
      <div className="container mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)_290px] xl:grid-cols-[270px_minmax(0,760px)_310px] xl:justify-center">
          <BibleStudyTools
            study={study}
            bookName={canonicalBookName}
            chapter={chapterParam}
            reference={passage?.reference || `${canonicalBookName} ${chapterParam}`}
            selectedVerse={selectedVerse}
            onClearSelection={() => setSelectedVerse(null)}
          />

          <div className="min-w-0 pb-32 lg:pb-0">
            {/* Navigation Toolbar */}
            <div className="mb-8 flex flex-col items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:p-4">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <SelectNative
                  value={canonicalBookName}
                  onChange={(e) => setLocation(`/bible/${encodeURIComponent(e.target.value)}/1`)}
                  className="w-full bg-background font-medium text-foreground sm:w-[180px]"
                  disabled={isBooksLoading}
                  aria-label="Select Bible Book"
                >
                  {isBooksLoading ? (
                    <option>Loading...</option>
                  ) : (
                    books?.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))
                  )}
                </SelectNative>

                <SelectNative
                  value={chapterParam.toString()}
                  onChange={(e) => setLocation(`/bible/${encodeURIComponent(canonicalBookName)}/${e.target.value}`)}
                  className="w-24 bg-background font-medium text-foreground sm:w-28"
                  disabled={!currentBook}
                  aria-label="Select Chapter"
                >
                  {chapterOptions.map(c => (
                    <option key={c} value={c}>Ch. {c}</option>
                  ))}
                </SelectNative>
              </div>

              <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Go to a chapter, e.g. John 3"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="bg-background/50 pl-9 transition-colors focus:bg-background"
                  aria-label="Search reference"
                />
              </form>
            </div>

            {/* Reader Content */}
            <div className="relative min-h-[60vh] overflow-hidden rounded-xl border bg-card px-5 py-10 shadow-sm sm:px-10 sm:py-14">
              <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

              {isPassageLoading ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-4 text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Loading {bookParam} {chapterParam}...</p>
                </div>
              ) : passageError ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-4 text-destructive animate-in fade-in zoom-in-95 duration-300">
                  <AlertCircle className="h-12 w-12" />
                  <p className="text-center font-medium">Sorry, we couldn't load this passage.</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              ) : passage ? (
                <article className="animate-in fade-in duration-500">
                  <h1 className="mb-10 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {passage.reference}
                  </h1>
                  <div className="font-sans text-lg leading-loose tracking-wide text-foreground/90">
                    <p className="mb-6">
                      {passage.verses.map((verse) => {
                        const studyVerse: StudyVerse = {
                          id: getVerseKey(verse.bookName, verse.chapter, verse.verse),
                          bookName: verse.bookName,
                          chapter: verse.chapter,
                          verse: verse.verse,
                          text: verse.text,
                        }
                        const highlight = study.data.highlights[studyVerse.id]?.color
                        const isSelected = selectedVerse?.id === studyVerse.id

                        return (
                          <button
                            key={studyVerse.id}
                            id={`verse-${verse.verse}`}
                            type="button"
                            onClick={() => setSelectedVerse(studyVerse)}
                            className={cn(
                              "mr-1 inline rounded-md px-1 text-left transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              highlight && verseHighlightClasses[highlight],
                              isSelected && "ring-2 ring-primary/50 ring-offset-1",
                            )}
                            aria-pressed={isSelected}
                            aria-label={`Select ${verse.bookName} ${verse.chapter}:${verse.verse}`}
                          >
                            <sup className="relative top-[-0.2em] mr-1 select-none align-super text-[0.7em] font-bold text-primary">
                              {verse.verse}
                            </sup>
                            <span>{verse.text}</span>
                          </button>
                        )
                      })}
                    </p>
                  </div>

                  <div className="mt-16 space-y-2 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
                    <p className="mx-auto max-w-xl leading-relaxed opacity-80">{passage.copyright}</p>
                  </div>
                </article>
              ) : null}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPrevChapter}
                className="gap-2 bg-card hover:bg-muted"
                disabled={isPassageLoading || (currentBook?.id === books?.[0]?.id && chapterParam === 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={goToNextChapter}
                className="gap-2 bg-card hover:bg-muted"
                disabled={isPassageLoading || (currentBook?.id === books?.[books.length - 1]?.id && chapterParam === currentBook?.chapters)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <BibleRecap />
        </div>
      </div>
    </Layout>
  )
}