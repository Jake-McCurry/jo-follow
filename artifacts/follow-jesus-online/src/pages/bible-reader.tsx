import { useRoute, useLocation } from "wouter"
import { Layout } from "@/components/layout"
import { useListBibleBooks, useGetBiblePassage, getGetBiblePassageQueryKey } from "@workspace/api-client-react"
import { SelectNative } from "@/components/ui/select-native"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Search, ArrowLeft } from "lucide-react"
import { useState, useMemo, useEffect, FormEvent } from "react"
import { Link } from "wouter"
import { useTrackRecentPage } from "@/hooks/use-recent-page"

export function BibleReaderPage() {
  useTrackRecentPage();
  const [match, params] = useRoute("/bible/:book/:chapter")
  const [, setLocation] = useLocation()
  
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

  useEffect(() => {
    if (!isBooksLoading && books && !currentBook) {
      setLocation("/bible/John/3", { replace: true })
    }
  }, [books, currentBook, isBooksLoading, setLocation])

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
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4">
            <Link href="/bible">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bible Menu
            </Link>
          </Button>
        </div>
        
        {/* Navigation Toolbar */}
        <div className="bg-card border rounded-xl p-3 sm:p-4 shadow-sm mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SelectNative 
              value={currentBook?.name || bookParam}
              onChange={(e) => setLocation(`/bible/${encodeURIComponent(e.target.value)}/1`)}
              className="w-full sm:w-[180px] font-medium text-foreground bg-background"
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
              onChange={(e) => setLocation(`/bible/${encodeURIComponent(currentBook?.name || bookParam)}/${e.target.value}`)}
              className="w-24 sm:w-28 font-medium text-foreground bg-background"
              disabled={!currentBook}
              aria-label="Select Chapter"
            >
              {chapterOptions.map(c => (
                <option key={c} value={c}>Ch. {c}</option>
              ))}
            </SelectNative>
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
              type="text" 
                placeholder="Go to a chapter, e.g. John 3" 
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9 bg-background/50 focus:bg-background transition-colors"
              aria-label="Search reference"
            />
          </form>
        </div>

        {/* Reader Content */}
        <div className="bg-card rounded-xl px-6 py-10 sm:px-12 sm:py-14 shadow-sm border min-h-[60vh] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
          
          {isPassageLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Loading {bookParam} {chapterParam}...</p>
            </div>
          ) : passageError ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="w-12 h-12" />
              <p className="text-center font-medium">Sorry, we couldn't load this passage.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : passage ? (
            <article className="animate-in fade-in duration-500">
              <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-foreground text-center tracking-tight">
                {passage.reference}
              </h1>
              <div className="text-lg leading-loose text-foreground/90 font-sans tracking-wide">
                <p className="mb-6">
                  {passage.verses.map((v, index) => (
                    <span key={`${v.chapter}-${v.verse}-${index}`} className="inline mr-2">
                      <sup className="text-[0.7em] font-bold text-primary mr-1 select-none align-super top-[-0.2em] relative">{v.verse}</sup>
                      <span>{v.text}</span>
                    </span>
                  ))}
                </p>
              </div>

              <div className="mt-16 pt-8 border-t border-border/50 text-sm text-muted-foreground text-center space-y-2">
                <p className="max-w-xl mx-auto leading-relaxed opacity-80">{passage.copyright}</p>
              </div>
            </article>
          ) : null}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={goToPrevChapter}
            className="gap-2 bg-card hover:bg-muted"
            disabled={isPassageLoading || (currentBook?.id === books?.[0]?.id && chapterParam === 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button 
            variant="outline" 
            onClick={goToNextChapter}
            className="gap-2 bg-card hover:bg-muted"
            disabled={isPassageLoading || (currentBook?.id === books?.[books.length - 1]?.id && chapterParam === currentBook?.chapters)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Layout>
  )
}