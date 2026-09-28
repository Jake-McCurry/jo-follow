import {
  BIBLE_STUDY_DATA_VERSION,
  type BibleStudyData,
} from "../hooks/use-bible-study"

function verseLabel(item: { bookName: string; chapter: number; verse: number; version?: "NET" | "KJV" }) {
  return `${item.bookName} ${item.chapter}:${item.verse}${item.version ? ` (${item.version})` : ""}`
}

export function formatBibleStudyAsText(data: BibleStudyData): string {
  const lines = [
    "Follow Jesus Online — Saved Bible Study",
    `Exported ${new Date().toLocaleString()}`,
    "",
    "BOOKMARKS",
  ]
  for (const item of data.bookmarks) {
    lines.push(item.kind === "chapter" ? `• ${item.reference}` : `• ${verseLabel(item)}\n  ${item.text}`)
  }
  if (!data.bookmarks.length) lines.push("None")
  lines.push("", "HIGHLIGHTS")
  const highlights = Object.values(data.highlights)
  for (const item of highlights) lines.push(`• ${verseLabel(item)} [${item.color}]\n  ${item.text}`)
  if (!highlights.length) lines.push("None")
  lines.push("", "NOTES")
  const notes = Object.values(data.notes)
  for (const item of notes) lines.push(`• ${verseLabel(item)}\n  ${item.text}\n  Note: ${item.note}`)
  if (!notes.length) lines.push("None")
  return `${lines.join("\n")}\n`
}

export function downloadBibleStudy(data: BibleStudyData, format: "backup" | "text"): void {
  const isBackup = format === "backup"
  const blob = new Blob(
    [isBackup ? JSON.stringify(data, null, 2) : formatBibleStudyAsText(data)],
    { type: isBackup ? "application/json" : "text/plain;charset=utf-8" },
  )
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = isBackup
    ? `follow-jesus-bible-study-v${BIBLE_STUDY_DATA_VERSION}.json`
    : "follow-jesus-bible-study.txt"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}