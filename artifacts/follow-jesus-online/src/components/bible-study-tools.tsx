import { ChangeEvent, useEffect, useRef, useState } from "react"
import { selectionReference } from "@/lib/bible-verse-selection"
import { Link } from "wouter"
import {
  Bookmark,
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
import { downloadBibleStudy } from "@/lib/bible-study-export"
import {
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
  purple: "bg-purple-400",
}

interface BibleStudyToolsProps {
  study: BibleStudyController
  bookName: string
  chapter: number
  reference: string
  selectedVerse: StudyVerse | null
  selectedVerses: StudyVerse[]
  onClearSelection?: () => void
  nextChapter: { bookName: string; chapter: number } | null
  version: "NET" | "KJV"
}

export function BibleStudyTools({
  study,
  bookName,
  chapter,
  reference,
  selectedVerse,
  selectedVerses,
  onClearSelection,
  nextChapter,
  version,
}: BibleStudyToolsProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState("")
  const [pendingImport, setPendingImport] = useState<BibleStudyData | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const chapterId = `chapter|${bookName.trim().toLowerCase()}|${chapter}`
  const chapterIsSaved = study.data.bookmarks.some((bookmark) => bookmark.id === chapterId)
  const verseIsSaved = selectedVerses.length > 0 && selectedVerses.every(verse =>
    study.data.bookmarks.some(bookmark => bookmark.id === verse.id))
  const firstHighlight = selectedVerse ? study.data.highlights[selectedVerse.id]?.color : undefined
  const selectedHighlight = selectedVerses.every(verse => study.data.highlights[verse.id]?.color === firstHighlight) ? firstHighlight : undefined
  const hasHighlights = selectedVerses.some(verse => study.data.highlights[verse.id])
  const selectedReference = selectionReference(selectedVerses)
  const selectedText = selectedVerses.map(verse => `${verse.text}\n—${verse.bookName} ${verse.chapter}:${verse.verse}`).join("\n\n")
  const selectedNote = selectedVerse ? study.data.notes[selectedVerse.id]?.note ?? "" : ""

  useEffect(() => {
    setNoteDraft(selectedNote)
  }, [selectedNote, selectedVerse?.id])

  const shareUrl = selectedVerse
    ? `${window.location.origin}${window.location.pathname}${window.location.search}#verses-${selectedVerses.map(verse => verse.verse).join(",")}`
    : window.location.href

  const handleExport = (format: "backup" | "text") => {
    downloadBibleStudy(study.data, format)
    toast({
      title: format === "backup" ? "Study backup downloaded" : "Readable study downloaded",
      description: format === "backup"
        ? "Keep this backup file to restore your saved items later."
        : "This text file is for reading or printing. Use Backup for a restorable copy.",
    })
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    let imported: BibleStudyData | null = null
    try {
      imported = parseImportedBibleStudyData(await file.text())
    } catch {
      // An unreadable file is reported in the same way as an invalid backup.
    }
    if (!imported) {
      toast({
        title: "That backup could not be restored",
        description: "Choose the .json file saved using Backup. Readable text copies cannot restore saved study.",
        variant: "destructive",
      })
      return
    }

    setPendingImport(imported)
    setIsImportOpen(true)
  }

  const finishImport = (mode: "merge" | "replace") => {
    if (!pendingImport) return
    const saved = mode === "merge" ? study.importData(pendingImport) : study.replaceData(pendingImport)
    if (!saved) {
      toast({
        title: "Backup could not be saved",
        description: "This browser blocked local storage. Try another browser or check its privacy settings.",
        variant: "destructive",
      })
      return
    }
    setIsImportOpen(false)
    setPendingImport(null)
    toast({
      title: "Study backup restored",
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
    <aside id="bible-study-tools" className="space-y-4 lg:sticky lg:top-32" aria-label="Bible study tools">
      <div>
        <Button
          type="button"
          variant={chapterIsSaved ? "warm" : "outline"}
          className="mt-4 w-full justify-start border-warm-200"
          onClick={() => study.toggleChapterBookmark({ bookName, chapter, reference })}
          disabled={!study.storageAvailable}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          {chapterIsSaved ? "Chapter saved" : "Save this chapter"}
        </Button>

        {study.data.lastRead && (
          (study.data.lastRead.bookName !== bookName || study.data.lastRead.chapter !== chapter || nextChapter) && (
          <Button asChild variant="ghost" className="mt-2 w-full justify-start hover:bg-warm-50">
            <Link href={study.data.lastRead.bookName === bookName && study.data.lastRead.chapter === chapter && nextChapter
              ? `/bible/${encodeURIComponent(nextChapter.bookName)}/${nextChapter.chapter}${version === "KJV" ? "?version=KJV" : ""}`
              : `/bible/${encodeURIComponent(study.data.lastRead.bookName)}/${study.data.lastRead.chapter}${version === "KJV" ? "?version=KJV" : ""}`}>
              <History className="mr-2 h-4 w-4" />
              {study.data.lastRead.bookName === bookName && study.data.lastRead.chapter === chapter
                ? `Read ${nextChapter?.bookName} ${nextChapter?.chapter}`
                : `Continue ${study.data.lastRead.reference}`}
            </Link>
          </Button>
        ))}
      </div>

      <section id="choose-a-verse" tabIndex={-1} className="scroll-mt-40 rounded-2xl border border-card-border bg-card p-4 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-warm-500">
        <h3 className="font-bold text-foreground">
          {selectedVerse
            ? selectedReference
            : "Choose a verse"}
        </h3>

        {selectedVerse ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {selectedText}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={verseIsSaved ? "warm" : "outline"}
                className="border-warm-200 hover:bg-warm-50"
                onClick={() => study.toggleVerseBookmarks(selectedVerses)}
                disabled={!study.storageAvailable}
              >
                <Bookmark className="mr-1.5 h-4 w-4" />
                {verseIsSaved ? "Saved" : selectedVerses.length > 1 ? "Save verses" : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selectedNote ? "secondary" : "outline"}
                className="border-warm-200 hover:bg-warm-50"
                onClick={() => setIsNoteOpen(true)}
                disabled={!study.storageAvailable || selectedVerses.length > 1}
                title={selectedVerses.length > 1 ? "Select one verse to write a note" : "Add a note"}
              >
                <NotebookPen className="mr-1.5 h-4 w-4" />
                {selectedVerses.length > 1 ? "Note (one verse)" : "Note"}
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
                    onClick={() => study.setHighlights(selectedVerses, color)}
                    disabled={!study.storageAvailable}
                    className={`h-8 w-8 rounded-full border-2 ${colorClasses[color]} ${
                      selectedHighlight === color
                        ? "border-warm-500 ring-2 ring-warm-500/30"
                        : "border-white shadow-sm"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={`Highlight ${selectedReference} ${color}`}
                    aria-pressed={selectedHighlight === color}
                  />
                ))}
                {hasHighlights && (
                  <button
                    type="button"
                    onClick={() => study.setHighlights(selectedVerses, null)}
                    className="rounded-md px-2 text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-warm-800"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <ShareButton
              title={`${selectedReference} (${version})`}
              text={`${selectedText}\n\n${version === "NET" ? "Scripture quoted from the NET Bible." : "King James Version (public domain)."}`}
              url={shareUrl}
              label={selectedVerses.length > 1 ? "Share verses" : "Share verse"}
              className="mt-4 w-full border-warm-200 hover:bg-warm-50"
            />
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tap one or more verses in the passage, then save, highlight or share your selection. Tap a selected verse again to remove it. Notes are written one verse at a time.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
        <Button asChild variant="outline" className="w-full justify-start border-warm-200 hover:bg-warm-50">
          <Link href="/bible/saved">
            <Save className="mr-2 h-4 w-4" />
            View saved items
          </Link>
        </Button>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => handleExport("text")} className="hover:bg-warm-50">
            <Download className="mr-1.5 h-4 w-4" />
            Save text
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="hover:bg-warm-50"
            onClick={() => importInputRef.current?.click()}
            disabled={!study.storageAvailable}
          >
            <FileUp className="mr-1.5 h-4 w-4" />
            Restore
          </Button>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => handleExport("backup")} className="mt-1 w-full justify-start hover:bg-warm-50">
          <Download className="mr-1.5 h-4 w-4" />
          Backup
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={handleImport}
          aria-label="Restore Bible study backup"
        />
        <p className="mt-2 text-xs text-muted-foreground">Use Backup before clearing browser data or changing devices. Restore loads a backup file; Save text creates a readable copy.</p>
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
          Local browser storage is unavailable. Saving, highlighting, notes, and restoring are disabled in this session.
        </div>
      )}

      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Note for {selectedVerse?.bookName} {selectedVerse?.chapter}:{selectedVerse?.verse}
            </DialogTitle>
            <DialogDescription>
              This private note stays only in this browser unless you save a backup.
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
            <DialogTitle>Restore Bible study backup</DialogTitle>
            <DialogDescription>
              Combine keeps your current items and adds the backup. Replace removes current items first.
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
              Combine saved items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedVerse && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-warm-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(7,49,146,0.14)] backdrop-blur lg:hidden"
          role="region"
          aria-label="Selected verse study tools"
          aria-live="polite"
        >
          <div className="mx-auto max-w-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {selectedReference}
                </p>
                <p className="mt-0.5 max-h-24 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
                  {selectedVerses.length > 1 ? `${selectedVerses.length} verses selected` : selectedVerse.text}
                </p>
              </div>
              {onClearSelection && (
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="shrink-0 rounded px-1 text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-warm-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-500"
                >
                  Close
                </button>
              )}
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <Button
                type="button"
                size="sm"
                variant={verseIsSaved ? "warm" : "outline"}
                onClick={() => study.toggleVerseBookmarks(selectedVerses)}
                disabled={!study.storageAvailable}
                className="w-full px-2 border-warm-200 hover:bg-warm-50"
              >
                <Bookmark className="mr-1 h-4 w-4" />
                {verseIsSaved ? "Saved" : "Save"}
              </Button>

              <Button
                type="button"
                size="sm"
                variant={selectedNote ? "secondary" : "outline"}
                onClick={() => setIsNoteOpen(true)}
                disabled={!study.storageAvailable || selectedVerses.length > 1}
                title={selectedVerses.length > 1 ? "Select one verse to write a note" : "Add a note"}
                className="w-full px-2 border-warm-200 hover:bg-warm-50"
              >
                <NotebookPen className="mr-1 h-4 w-4" />
                Note
              </Button>
              <ShareButton
                  title={`${selectedReference} (${version})`}
                  text={`${selectedText}\n\n${version === "NET" ? "Scripture quoted from the NET Bible." : "King James Version (public domain)."}`}
                url={shareUrl}
                label="Share"
                className="h-9 w-full justify-center px-2 border-warm-200 hover:bg-warm-50"
              />
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Highlight</span>
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={`mobile-${color}`}
                  type="button"
                  onClick={() => study.setHighlights(selectedVerses, color)}
                  disabled={!study.storageAvailable}
                  className={`h-7 w-7 rounded-full border-2 ${colorClasses[color]} ${
                    selectedHighlight === color
                      ? "border-warm-500 ring-2 ring-warm-500/30"
                      : "border-white shadow-sm"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  aria-label={`Highlight ${selectedReference} ${color}`}
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