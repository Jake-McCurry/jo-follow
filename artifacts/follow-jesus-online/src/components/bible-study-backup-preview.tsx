import { Bookmark, Highlighter, NotebookPen } from "lucide-react"
import type { BibleStudyData } from "@/hooks/use-bible-study"

interface BibleStudyBackupPreviewProps {
  data: BibleStudyData
}

export function getBibleStudyBackupPreviewSummary(data: BibleStudyData) {
  const bookmarks = data.bookmarks.length
  const highlights = Object.keys(data.highlights).length
  const notes = Object.keys(data.notes).length
  const total = bookmarks + highlights + notes

  return {
    bookmarks,
    highlights,
    notes,
    total,
    status: total === 0 ? "Empty backup" : total <= 2 ? "Small backup" : `${total} saved items`,
  }
}

export function BibleStudyBackupPreview({ data }: BibleStudyBackupPreviewProps) {
  const summary = getBibleStudyBackupPreviewSummary(data)
  const counts = [
    { label: "Bookmarks", count: summary.bookmarks, icon: Bookmark },
    { label: "Highlights", count: summary.highlights, icon: Highlighter },
    { label: "Notes", count: summary.notes, icon: NotebookPen },
  ]
  const isEmpty = summary.status === "Empty backup"
  const isSmall = summary.status === "Small backup"

  return (
    <section
      className="rounded-xl border bg-muted/30 p-3"
      aria-label="Selected backup contents"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Backup contents</p>
        <span
          className={
            isEmpty || isSmall
              ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
              : "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
          }
        >
          {summary.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 divide-x rounded-lg border bg-background">
        {counts.map(({ label, count, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center gap-1 px-2 py-2 text-center">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-lg font-bold leading-none text-foreground">{count}</span>
            <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {isEmpty
          ? "This valid backup has no bookmarks, highlights, or notes."
          : isSmall
            ? "This backup contains very few saved items. Make sure it is the file you intended to import."
            : "Review these counts before choosing Replace current data."}
      </p>
    </section>
  )
}