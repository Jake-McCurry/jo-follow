import { ChangeEvent, useEffect, useRef, useState } from "react"
import { Link } from "wouter"
import {
  Bookmark,
  BookMarked,
  Download,
  FileUp,
  Highlighter,
  History,
  NotebookPen,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ShareButton } from "@/components/share-button"
import { BibleStudyBackupPreview } from "@/components/bible-study-backup-preview"
import { useToast } from "@/hooks/use-toast"
import {
  BIBLE_STUDY_DATA_VERSION,
  HIGHLIGHT_COLORS,
  type BibleStudyData,
  type HighlightColor,
  type StudyVerse,
  parseImportedBibleStudyData,
  useBibleStudy,
} from "@/hooks/use-bible-study"

type BibleStudyController = ReturnType<typeof useBibleStudy>

const colorClasses: Record<HighlightColor, string> = {
  yellow: "bg-amber-300",
  blue: "bg-sky-300",
  green: "bg-emerald-300",
  pink: "bg-pink-300",
}

interface BibleStudyToolsProps {
  study: BibleStudyController
  bookName: string
  chapter: number
  reference: string
  selectedVerse: StudyVerse | null
  onClearSelection?: () => void
}

export function BibleStudyTools({
  study,
  bookName,
  chapter,
  reference,
  selectedVerse,
  onClearSelection,
}: BibleStudyToolsProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState("")
  const [pendingImport, setPendingImport] = useState<BibleStudyData | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const chapterId = `chapter|${bookName.trim().toLowerCase()}|${chapter}`
  const chapterIsSaved = study.data.bookmarks.some((bookmark) => bookmark.id === chapterId)
  const verseIsSaved = selectedVerse
    ? study.data.bookmarks.some((bookmark) => bookmark.id === selectedVerse.id)
    : false
  const selectedHighlight = selectedVerse ? study.data.highlights[selectedVerse.id]?.color : undefined
  const selectedNote = selectedVerse ? study.data.notes[selectedVerse.id]?.note ?? "" : ""

  useEffect(() => {
    setNoteDraft(selectedNote)
  }, [selectedNote, selectedVerse?.id])

  const shareUrl = selectedVerse
    ? `${window.location.origin}${window.location.pathname}#verse-${selectedVerse.verse}`
    : window.location.href

  const handleExport = () => {
    const payload = JSON.stringify(study.data, null, 2)
    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `follow-jesus-bible-study-v${BIBLE_STUDY_DATA_VERSION}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    toast({
      title: "Study backup downloaded",
      description: "Keep this file somewhere safe so you can import it later.",
    })
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const imported = parseImportedBibleStudyData(await file.text())
    if (!imported) {
      toast({
        title: "That backup could not be imported",
        description: "Choose a valid Follow Jesus Bible study backup file.",
        variant: "destructive",
      })
      return
    }

    setPendingImport(imported)
    setIsImportOpen(true)
  }

  const finishImport = (mode: "merge" | "replace") => {
    if (!pendingImport) return
    if (mode === "merge") study.importData(pendingImport)
    else study.replaceData(pendingImport)
    setIsImportOpen(false)
    setPendingImport(null)
    toast({
      title: "Study backup imported",
      description:
        mode === "merge"
          ? "The backup was merged with this browser’s saved study."
          : "This browser’s saved study was replaced with the backup.",
    })
  }

  const saveNote = () => {
    if (!selectedVerse) return
    study.setNote(selectedVerse, noteDraft)
    setIsNoteOpen(false)
    toast({
      title: noteDraft.trim() ? "Verse note saved" : "Verse note removed",
      description: `${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse}`,
    })
  }

  return (
    <aside id="bible-study-tools" className="space-y-4 lg:sticky lg:top-24" aria-labelledby="study-tools-heading">
      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-primary" />
          <h2 id="study-tools-heading" className="text-xl font-bold">
            Study Tools
          </h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Select a verse in the passage to save, highlight, note, or share it.
        </p>

        <Button
          type="button"
          variant={chapterIsSaved ? "default" : "outline"}
          className="mt-4 w-full justify-start"
          onClick={() => study.toggleChapterBookmark({ bookName, chapter, reference })}
          disabled={!study.storageAvailable}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          {chapterIsSaved ? "Chapter saved" : "Save this chapter"}
        </Button>

        {study.data.lastRead && (
          <Button asChild variant="ghost" className="mt-2 w-full justify-start">
            <Link href={`/bible/${encodeURIComponent(study.data.lastRead.bookName)}/${study.data.lastRead.chapter}`}>
              <History className="mr-2 h-4 w-4" />
              Continue {study.data.lastRead.reference}
            </Link>
          </Button>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <h3 className="font-bold text-foreground">
          {selectedVerse
            ? `${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse}`
            : "Choose a verse"}
        </h3>

        {selectedVerse ? (
          <>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {selectedVerse.text}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={verseIsSaved ? "default" : "outline"}
                onClick={() => study.toggleVerseBookmark(selectedVerse)}
                disabled={!study.storageAvailable}
              >
                <Bookmark className="mr-1.5 h-4 w-4" />
                {verseIsSaved ? "Saved" : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selectedNote ? "secondary" : "outline"}
                onClick={() => setIsNoteOpen(true)}
                disabled={!study.storageAvailable}
              >
                <NotebookPen className="mr-1.5 h-4 w-4" />
                Note
              </Button>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Highlighter className="h-4 w-4" />
                Highlight
              </div>
              <div className="flex flex-wrap gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => study.setHighlight(selectedVerse, color)}
                    disabled={!study.storageAvailable}
                    className={`h-8 w-8 rounded-full border-2 ${colorClasses[color]} ${
                      selectedHighlight === color
                        ? "border-[#073192] ring-2 ring-[#073192]/30"
                        : "border-white shadow-sm"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={`Highlight ${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse} ${color}`}
                    aria-pressed={selectedHighlight === color}
                  />
                ))}
                {selectedHighlight && (
                  <button
                    type="button"
                    onClick={() => study.setHighlight(selectedVerse, null)}
                    className="rounded-md px-2 text-xs font-semibold text-muted-foreground underline underline-offset-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <ShareButton
              title={`${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse} (NET)`}
              text={`${selectedVerse.text}\n\nScripture quoted from the NET Bible.`}
              url={shareUrl}
              label="Share verse"
              className="mt-4 w-full"
            />
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tap or click any verse to make its tools available here.
          </p>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/bible/saved">
            <Save className="mr-2 h-4 w-4" />
            View saved items
          </Link>
        </Button>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => importInputRef.current?.click()}
            disabled={!study.storageAvailable}
          >
            <FileUp className="mr-1.5 h-4 w-4" />
            Import
          </Button>
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={handleImport}
          aria-label="Import Bible study backup"
        />
      </section>

      <div
        className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 shadow-sm"
        role="note"
      >
        <strong className="block font-bold">Your saved study is only on this device.</strong>
        If you return using a VPN, private or incognito browsing, another browser or device, or delete cookies
        and site data, your bookmarks, highlights, and notes may be lost or unavailable.
      </div>

      {!study.storageAvailable && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          Local browser storage is unavailable. Saving, highlighting, notes, and imports are disabled in this session.
        </div>
      )}

      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Note for {selectedVerse?.bookName} {selectedVerse?.chapter}:{selectedVerse?.verse}
            </DialogTitle>
            <DialogDescription>
              This private note stays only in this browser unless you export a backup.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Write what stands out to you..."
            rows={8}
            maxLength={4000}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsNoteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveNote} disabled={!selectedVerse || !study.storageAvailable}>
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Bible study backup</DialogTitle>
            <DialogDescription>
              Merge keeps your current items and adds the backup. Replace removes current items first.
            </DialogDescription>
          </DialogHeader>
          {pendingImport && <BibleStudyBackupPreview data={pendingImport} />}
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => finishImport("replace")}
            >
              Replace current data
            </Button>
            <Button type="button" onClick={() => finishImport("merge")}>
              Merge saved data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedVerse && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-primary/20 bg-card/95 p-3 shadow-[0_-8px_30px_rgba(7,49,146,0.14)] backdrop-blur lg:hidden"
          role="region"
          aria-label="Selected verse study tools"
          aria-live="polite"
        >
          <div className="mx-auto max-w-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {selectedVerse.bookName} {selectedVerse.chapter}:{selectedVerse.verse}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{selectedVerse.text}</p>
              </div>
              {onClearSelection && (
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="shrink-0 rounded px-1 text-xs font-semibold text-muted-foreground underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Close
                </button>
              )}
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <Button
                type="button"
                size="sm"
                variant={verseIsSaved ? "default" : "outline"}
                onClick={() => study.toggleVerseBookmark(selectedVerse)}
                disabled={!study.storageAvailable}
                className="w-full px-2"
              >
                <Bookmark className="mr-1 h-4 w-4" />
                {verseIsSaved ? "Saved" : "Save"}
              </Button>

              <Button
                type="button"
                size="sm"
                variant={selectedNote ? "secondary" : "outline"}
                onClick={() => setIsNoteOpen(true)}
                disabled={!study.storageAvailable}
                className="w-full px-2"
              >
                <NotebookPen className="mr-1 h-4 w-4" />
                Note
              </Button>
              <ShareButton
                title={`${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse} (NET)`}
                text={`${selectedVerse.text}\n\nScripture quoted from the NET Bible.`}
                url={shareUrl}
                label="Share"
                className="h-9 w-full justify-center px-2"
              />
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Highlight</span>
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={`mobile-${color}`}
                  type="button"
                  onClick={() => study.setHighlight(selectedVerse, color)}
                  disabled={!study.storageAvailable}
                  className={`h-7 w-7 rounded-full border-2 ${colorClasses[color]} ${
                    selectedHighlight === color
                      ? "border-[#073192] ring-2 ring-[#073192]/30"
                      : "border-white shadow-sm"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  aria-label={`Highlight ${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse} ${color}`}
                  aria-pressed={selectedHighlight === color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}