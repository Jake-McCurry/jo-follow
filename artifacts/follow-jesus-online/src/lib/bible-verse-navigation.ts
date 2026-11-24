/** Both citation links and shared multi-verse selections use these anchors. */
export function verseNumbersFromHash(hash: string): number[] {
  const match = hash.match(/^#verses?-(\d+(?:,\d+)*)$/)
  if (!match) return []
  return [...new Set(match[1].split(",").map(Number))]
    .filter(value => Number.isSafeInteger(value) && value > 0)
}

/** Keep the requested verse just below the sticky site header, not off screen. */
export function scrollToBibleVerse(verse: number): boolean {
  const target = document.getElementById(`verse-${verse}`)
  if (!target) return false
  const header = document.querySelector<HTMLElement>("[data-site-header]")
  const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom ?? 0)
  window.scrollTo({
    top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerBottom - 16),
    behavior: "instant",
  })
  return true
}
