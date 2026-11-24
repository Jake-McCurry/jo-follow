import { test } from "node:test"
import assert from "node:assert/strict"
import { verseNumbersFromHash, scrollToBibleVerse } from "../src/lib/bible-verse-navigation"
import { knowingGodScriptureHref } from "../src/components/knowing-god/scripture-link"

test("citations and shared selections retain their first verse", () => {
  assert.deepEqual(verseNumbersFromHash("#verse-16"), [16])
  assert.deepEqual(verseNumbersFromHash("#verses-16,17,16"), [16, 17])
  for (const hash of ["", "#verse-0", "#other-16", "#verse-NaN", "#verses-1-x"]) {
    assert.deepEqual(verseNumbersFromHash(hash), [])
  }
  for (const reference of ["John 3:16", "Psalm 23:4", "Jude 24"]) {
    const href = knowingGodScriptureHref(reference)
    assert.equal(verseNumbersFromHash(new URL(href, "https://example.org").hash).length, 1)
  }
})

test("verse positioning clears the sticky header on desktop and mobile", () => {
  const previousDocument = globalThis.document
  const previousWindow = globalThis.window
  try {
    for (const headerHeight of [120, 178]) {
      let scroll: ScrollToOptions | undefined
      Object.assign(globalThis, {
        document: {
          getElementById: (id: string) => id === "verse-16" ? { getBoundingClientRect: () => ({ top: 1400 }) } : null,
          querySelector: () => ({ getBoundingClientRect: () => ({ bottom: headerHeight }) }),
        },
        window: { scrollY: 200, scrollTo: (options: ScrollToOptions) => { scroll = options } },
      })
      assert.equal(scrollToBibleVerse(16), true)
      assert.deepEqual(scroll, { top: 1600 - headerHeight - 16, behavior: "instant" })
      assert.equal(scrollToBibleVerse(999), false)
    }
  } finally {
    Object.assign(globalThis, { document: previousDocument, window: previousWindow })
  }
})
