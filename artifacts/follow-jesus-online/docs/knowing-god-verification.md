# Knowing God integration and verification

## Delivered routes

- `/knowing-god`
- `/knowing-god/introduction`
- `/knowing-god/introduction/about-this-edition`
- `/knowing-god/introduction/dedication`
- `/knowing-god/introduction/foundational-scriptures`
- `/knowing-god/introduction/devotional-guide`
- `/knowing-god/introduction/notable-quotations`

The homepage topic menu and Topical Concordance resource now link to the full
reader. The nine Connect with God resources remain grouped into three cards.
The separate Reflecting on God's Majesty and interim Promises links are unchanged.

## Inventory and host adaptations

- Imported the actual full React reader, cross-reference component, passage
  formatting, browser-history, devotional-selection and offline NET helpers.
- Imported complete introductory data, topic JSON, hashed payloads, local NET
  manifest/book files, source fonts/licenses, logo and cover assets.
- Preserved source content and asset bytes: all 220 original manifest entries
  were verified on extraction; 125 imported immutable content/data/asset files
  are also checked against that manifest by the destination's regression suite.
- Ported Astro introduction pages and the JO EQUIP header to React/Wouter rather
  than replacing the existing application framework or layout.
- Kept feature colors, reading styles and self-hosted font families isolated.
  Added a local return link. Original hub-only navigation links are explicit
  external links; Books and Read the Bible use existing local pages.
- Retained original local-storage keys, topic IDs and hash/history behavior.
  Assets and feature links respect the application's base path.
- Adapted generator output paths without regenerating or editing approved data.
- Fixed honest clipboard failure feedback, clearing filters at both
  cross-reference entry points, hyphenated devotional title search, mobile
  reading focus/scroll and print-header visibility.
- Did not add the source advertising pixel, runtime content APIs, credentials,
  authentication changes or database changes.

## Verified content totals

| Metric | Result |
|---|---:|
| Total index entries | 773 |
| Topic records | 649 |
| Cross-reference records | 124 |
| Scripture passages | 13,535 |
| Entries with Additional Scripture | 625 |
| Individual Additional Scripture sections | 627 |
| See-also records | 9,431 |
| Source markers | 2 |
| Unique local NET passage references | 7,814 |
| Local NET book files | 66 |

The source's `additionalScriptureCount` means entries containing supplemental
Scripture, not the number of individual sections. Both measures are listed
above to avoid confusing 625 entries with 627 sections.

## Feature-parity checklist

| Feature | Outcome |
|---|---|
| Full corpus, source relationships and immutable content | Passed checksum, count, reference and editorial regression checks |
| A–Z browsing and title search | Passed browser verification |
| Loaded-only definition/passage search scope | Preserved source behavior; content never presented as a global full-text index |
| Devotional topic selection | Passed source-topic correspondence and browser checks, including hyphenated spelling |
| Local NET/KJV text and preference persistence | Passed browser verification; no original-site/Bible.org content requests |
| Testament/book filters and cross-reference reset | Passed browser verification |
| Zero-passage cross-reference records | Passed corpus validation and browser verification using Abstinence |
| Browser Back/topic hashes | Passed unit and browser verification |
| Study-list add/remove and reload persistence | Passed browser verification |
| Copy references/passages and unavailable/rejected clipboard | Passed browser verification |
| Print action, hidden header/controls and retained study content | Passed targeted browser verification after fixing header visibility |
| Introduction index and all five complete article routes | Passed content checksums and browser verification |
| Introduction navigation and devotional filtering | Passed browser verification |
| Mobile topic toggle, reading focus/scroll and width | Passed at 390×844 after fixing focus/scroll |
| Original PDF/source-page comparison | Not run: original PDF was not supplied |
| Exact pixel comparison against the original running site | Not run; no exact-pixel-parity claim |

## Build and test results

- TypeScript check: passed.
- Production Vite build: passed.
- Existing article, Bible-study, recent-page, Rewatch and Connect with God suites:
  49 tests passed.
- Knowing God JavaScript suites: 27 tests passed.
- Python source tests: 8 passed, 2 explicitly skipped because the original PDF
  was not included.
- Python NET tests: 3 passed.
- Full local NET validation: all 7,814 references across 66 book files passed.
- Browser pass covered desktop and mobile routes, persistence, translations,
  cross-references, copy, print and all five introductions. The three issues
  found were fixed and confirmed with a focused browser check.
- No browser page errors or local Knowing God content request failures observed.
  Existing third-party telemetry requests were blocked/aborted by the browser;
  they are not Knowing God content dependencies.
- Vite reports the application's existing large main-bundle warning. The build
  succeeds; this integration does not claim that the existing app was
  comprehensively optimized.

Commands:

```sh
pnpm --filter @workspace/follow-jesus-online run typecheck
pnpm --filter @workspace/follow-jesus-online run build
pnpm --filter @workspace/follow-jesus-online run test:knowing-god
pnpm --filter @workspace/follow-jesus-online run validate:knowing-god-net
```

`validate:knowing-god-source` still requires the original PDF named in the source
generator. It must not be represented as passed until that document is supplied.

## Canonical domain and publishing

The destination's existing canonical-domain and `noindex,follow` policies remain
unchanged. No domain changes, publishing or Git-remote changes were performed.