import { ChangeEvent, Children, type ReactNode, useRef, useState } from "react"
import { Link } from "wouter"
import {
  Bookmark,
  BookOpen,
  Download,
  FileUp,
  Highlighter,
  History,
  NotebookPen,
  Trash2,
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { BibleStudyBackupPreview } from "@/components/bible-study-backup-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShareButton } from "@/components/share-button"
import { useToast } from "@/hooks/use-toast"
import { downloadBibleStudy } from "@/lib/bible-study-export"
import {
  type BibleStudyData,
  type ChapterBookmark,
  type HighlightColor,
  type VerseBookmark,
  parseImportedBibleStudyData,
  useBibleStudy,
} from "@/hooks/use-bible-study"

const colorClasses: Record<HighlightColor, string> = {
  yellow: "bg-amber-300",
  blue: "bg-sky-300",
  green: "bg-emerald-300",
  pink: "bg-pink-300",
  purple: "bg-purple-400",
}

function biblePath(bookName: string, chapter: number, verse?: number, version?: "NET" | "KJV") {
  const path = `/bible/${encodeURIComponent(bookName)}/${chapter}${version === "KJV" ? "?version=KJV" : ""}`
  return verse ? `${path}#verse-${verse}` : path
}

function bibleShareUrl(bookName: string, chapter: number, verse: number) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "")
  return `${window.location.origin}${basePath}${biblePath(bookName, chapter, verse)}`
}

export function BibleSavedPage() {
  const study = useBibleStudy()
  const importInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<BibleStudyData | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const { toast } = useToast()

  const chapterBookmarks = study.data.bookmarks.filter(
    (bookmark): bookmark is ChapterBookmark => bookmark.kind === "chapter",
  )
  const verseBookmarks = study.data.bookmarks.filter(
    (bookmark): bookmark is VerseBookmark => bookmark.kind === "verse",
  )
  const highlights = Object.values(study.data.highlights)
  const notes = Object.values(study.data.notes)
  const hasSavedItems = chapterBookmarks.length + verseBookmarks.length + highlights.length + notes.length > 0

  const handleExport = (format: "backup" | "text") => {
    downloadBibleStudy(study.data, format)
    toast({
      title: format === "backup" ? "Study backup downloaded" : "Readable study downloaded",
      description: format === "backup"
        ? "Import this JSON file later to restore your saved items."
        : "This text file is for reading or printing; import requires a JSON backup.",
    })
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
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
        title: "That backup could not be imported",
        description: "Choose a .json backup exported from this Bible reader. Text exports cannot be imported.",
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
      title: "Study backup imported",
      description:
        mode === "merge"
          ? "The backup was merged with this browser’s saved study."
          : "This browser’s saved study was replaced with the backup.",
    })
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-5 py-8 sm:px-8 md:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-warm-700">Account-free Bible study</p>
            <h1 className="mt-2 text-4xl font-bold text-foreground">Saved Bible Items</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
              Reopen your bookmarked chapters and verses, highlights, and private notes from this browser.
            </p>
          </div>
          <Button asChild variant="warm">
            <Link href={study.data.lastRead ? biblePath(study.data.lastRead.bookName, study.data.lastRead.chapter) : "/bible/John/1"}>
              <History className="mr-2 h-4 w-4" />
              {study.data.lastRead ? `Continue ${study.data.lastRead.reference}` : "Start reading"}
            </Link>
          </Button>
        </div>

        <div
          className="mt-8 rounded-2xl border-2 border-warm-300 bg-warm-100 p-5 text-sm leading-relaxed text-warm-900 shadow-sm"
          role="note"
        >
          <strong className="block font-bold">Your saved study is only on this device.</strong>
          If you return using a VPN, private or incognito browsing, another browser or device, or delete cookies
          and site data, your bookmarks, highlights, and notes may be lost or unavailable. Export a backup if you
          want to keep or move them.
        </div>

        {!study.storageAvailable && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
            Local browser storage is unavailable. Saved changes cannot persist in this session.
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => handleExport("text")}>
            <Download className="mr-2 h-4 w-4" />
            Export readable text
          </Button>
          <Button type="button" variant="outline" onClick={() => handleExport("backup")}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON backup
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => importInputRef.current?.click()}
            disabled={!study.storageAvailable}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import JSON backup
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={handleImportFile}
            aria-label="Import Bible study backup"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Only JSON backups can be imported. Text exports are for reading or printing.</p>

        {!hasSavedItems ? (
          <div className="mt-10 rounded-2xl border border-dashed border-warm-300 bg-warm-50 p-10 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-warm-700" />
            <h2 className="mt-4 text-2xl font-bold">Nothing saved yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Open a Bible chapter, select a verse, and use the study tools to bookmark, highlight, or add a note.
            </p>
            <Button asChild variant="warm" className="mt-6">
              <Link href="/bible/John/1">Read the Bible</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            <SavedSection
              icon={<Bookmark className="h-5 w-5 text-warm-700" />}
              title={`Bookmarks (${chapterBookmarks.length + verseBookmarks.length})`}
              emptyText="No bookmarked chapters or verses yet."
            >
              {chapterBookmarks.map((bookmark) => (
                <SavedRow key={bookmark.id}>
                  <div>
                    <p className="font-bold">{bookmark.reference}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Saved chapter</p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={biblePath(bookmark.bookName, bookmark.chapter)}>Open</Link>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => study.removeBookmark(bookmark.id)}
                      aria-label={`Remove ${bookmark.reference} bookmark`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SavedRow>
              ))}
              {verseBookmarks.map((bookmark) => (
                <SavedRow key={bookmark.id}>
                  <div className="min-w-0">
                    <p className="font-bold">{bookmark.reference}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{bookmark.text}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={biblePath(bookmark.bookName, bookmark.chapter, bookmark.verse, bookmark.version)}>Open</Link>
                    </Button>
                    <ShareButton
                      title={`${bookmark.reference} (${bookmark.version ?? "NET"})`}
                      text={`${bookmark.text}\n\n${bookmark.version === "KJV" ? "King James Version (public domain)." : "Scripture quoted from the NET Bible."}`}
                      url={bibleShareUrl(bookmark.bookName, bookmark.chapter, bookmark.verse)}
                      label="Share"
                      className="h-9 px-3"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => study.removeBookmark(bookmark.id)}
                      aria-label={`Remove ${bookmark.reference} bookmark`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SavedRow>
              ))}
            </SavedSection>

            <SavedSection
              icon={<Highlighter className="h-5 w-5 text-warm-700" />}
              title={`Highlights (${highlights.length})`}
              emptyText="No highlighted verses yet."
            >
              {highlights.map((highlight) => (
                <SavedRow key={highlight.id}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-4 w-4 rounded-full ${colorClasses[highlight.color]}`} aria-hidden="true" />
                      <p className="font-bold">{highlight.bookName} {highlight.chapter}:{highlight.verse}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{highlight.text}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={biblePath(highlight.bookName, highlight.chapter, highlight.verse, highlight.version)}>Open</Link>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => study.removeHighlight(highlight.id)}
                      aria-label={`Remove highlight from ${highlight.bookName} ${highlight.chapter}:${highlight.verse}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SavedRow>
              ))}
            </SavedSection>

            <SavedSection
              icon={<NotebookPen className="h-5 w-5 text-warm-700" />}
              title={`Notes (${notes.length})`}
              emptyText="No verse notes yet."
            >
              {notes.map((note) => (
                <SavedRow key={note.id}>
                  <div className="min-w-0">
                    <p className="font-bold">{note.bookName} {note.chapter}:{note.verse}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{note.note}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={biblePath(note.bookName, note.chapter, note.verse, note.version)}>Open</Link>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => study.removeNote(note.id)}
                      aria-label={`Remove note for ${note.bookName} ${note.chapter}:${note.verse}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </SavedRow>
              ))}
            </SavedSection>
          </div>
        )}
      </div>

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
    </Layout>
  )
}

function SavedSection({
  icon,
  title,
  emptyText,
  children,
}: {
  icon: ReactNode
  title: string
  emptyText: string
  children: ReactNode
}) {
  const items = Children.toArray(children)

  return (
    <section>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? items : <p className="rounded-xl border border-dashed border-warm-200 bg-warm-50 p-5 text-sm text-muted-foreground shadow-sm">{emptyText}</p>}
      </div>
    </section>
  )
}

function SavedRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-warm-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  )
}