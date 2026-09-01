import { type ReactNode, useEffect, useMemo, useRef, useState, FormEvent } from "react"
import { useLocation } from "wouter"
import { useListBibleBooks } from "@workspace/api-client-react"
import { BookOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectNative } from "@/components/ui/select-native"

interface BibleStartDialogProps {
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function parseBibleReference(value: string) {
  const str = value.trim()
  const chapterMatch = str.match(/^((?:[1-3]\s+)?[A-Za-z\s]+)\s+(\d+)(?:\s*:\s*\d+(?:-\d+)?)?$/)

  if (chapterMatch) {
    return {
      book: chapterMatch[1].trim(),
      chapter: Number.parseInt(chapterMatch[2], 10),
    }
  }

  const bookMatch = str.match(/^((?:[1-3]\s+)?[A-Za-z\s]+)$/)
  if (bookMatch) {
    return {
      book: bookMatch[1].trim(),
      chapter: 1,
    }
  }

  return null
}

export function BibleStartDialog({ children, open: controlledOpen, onOpenChange }: BibleStartDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState("John")
  const [selectedChapter, setSelectedChapter] = useState("1")
  const [searchInput, setSearchInput] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const [, setLocation] = useLocation()
  const { data: books, isLoading: isBooksLoading } = useListBibleBooks()
  const open = controlledOpen ?? uncontrolledOpen

  const currentBook = useMemo(
    () => books?.find((book) => book.name.toLowerCase() === selectedBook.toLowerCase()),
    [books, selectedBook],
  )
  const chapterOptions = Array.from({ length: currentBook?.chapters || 1 }, (_, index) => index + 1)

  useEffect(() => {
    if (!books?.length) return
    const defaultBook = books.find((book) => book.name.toLowerCase() === "john") ?? books[0]
    setSelectedBook((book) => books.some((item) => item.name.toLowerCase() === book.toLowerCase()) ? book : defaultBook.name)
  }, [books])

  useEffect(() => {
    if (currentBook && Number.parseInt(selectedChapter, 10) > currentBook.chapters) {
      setSelectedChapter("1")
    }
  }, [currentBook, selectedChapter])

  const goToChapter = (book: string, chapter: number) => {
    if (!book || !Number.isSafeInteger(chapter) || chapter < 1) return
    onOpenChange?.(false)
    if (controlledOpen === undefined) setUncontrolledOpen(false)
    setSearchInput("")
    setLocation(`/bible/${encodeURIComponent(book)}/${chapter}`)
  }

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const reference = parseBibleReference(searchInput)
    if (!reference) return
    goToChapter(reference.book, reference.chapter)
  }

  const handleSelectedChapter = () => {
    goToChapter(selectedBook, Number.parseInt(selectedChapter, 10))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange?.(nextOpen)
        if (controlledOpen === undefined) setUncontrolledOpen(nextOpen)
      }}
    >
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
        className="max-w-3xl rounded-2xl p-5 sm:p-7"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          searchRef.current?.focus()
        }}
      >
        <DialogHeader className="mb-2 pr-8">
          <DialogTitle className="flex items-center gap-2 text-left text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Read the NET Bible
          </DialogTitle>
          <DialogDescription className="text-left">
            Choose a book and chapter, or search for a passage to begin reading.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <SelectNative
                value={currentBook?.name || selectedBook}
                onChange={(event) => {
                  setSelectedBook(event.target.value)
                  setSelectedChapter("1")
                }}
                className="h-12 rounded-xl bg-background px-4 text-base font-medium sm:w-[230px]"
                disabled={isBooksLoading || !books?.length}
                aria-label="Select Bible book"
              >
                {isBooksLoading ? (
                  <option>Loading...</option>
                ) : (
                  books?.map((book) => (
                    <option key={book.id} value={book.name}>
                      {book.name}
                    </option>
                  ))
                )}
              </SelectNative>

              <SelectNative
                value={selectedChapter}
                onChange={(event) => setSelectedChapter(event.target.value)}
                className="h-12 w-28 rounded-xl bg-background px-4 text-base font-medium"
                disabled={!currentBook}
                aria-label="Select Bible chapter"
              >
                {chapterOptions.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    Ch. {chapter}
                  </option>
                ))}
              </SelectNative>
            </div>

            <form onSubmit={handleSearch} className="relative w-full sm:max-w-[340px]">
              <label htmlFor="bible-start-search" className="sr-only">
                Go to a chapter
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                id="bible-start-search"
                type="text"
                placeholder="Go to a chapter, e.g. John 3"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="h-12 rounded-xl bg-background pl-12 text-base"
                aria-label="Search Bible reference"
              />
            </form>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full sm:w-auto sm:self-end"
          onClick={handleSelectedChapter}
          disabled={isBooksLoading || !currentBook}
        >
          Read {currentBook?.name || selectedBook} {selectedChapter}
        </Button>
      </DialogContent>
    </Dialog>
  )
}