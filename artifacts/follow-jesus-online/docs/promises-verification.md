# God's Promises for Hope

The supplied DOCX is the structured content source, with the supplied 72-page PDF
retained unchanged as a local download and used for visual source checks.

The displayed product title is **God's Promises for Hope**, as requested.
The source title **God's Promises for a New Year** is retained in publication
information. Original Scripture wording and translation labels are preserved.

## Completeness

- Six requested groups, with 21, 13, 2, 18, 13 and 18 topics respectively.
- 85 complete topics and 568 quoted passages in the topic corpus.
- Full introductory content, category preambles, publication and closing
  resources retained. Only the printed table of contents is replaced by the
  interactive navigation.
- Every source paragraph outside the printed contents is checked for identical
  normalized text and exactly-once representation in the generated book.
- The source's unnumbered “Corinthians 2:12” is preserved, with an explicit
  explanatory note identifying its local reading link as 1 Corinthians 2:12.
- Original DOCX and PDF downloads are checked byte-for-byte against the uploads.

## Verification

Run `pnpm --filter @workspace/follow-jesus-online run test:promises`.
The normal prebuild includes these source and navigation checks.

Typecheck and production asset build passed. Browser verification covered:

- Both the sticky Promises link and homepage card.
- All six group controls, topic selection and direct hash loading.
- Saved study persistence without changing Knowing God's saved list.
- Printed translation filtering and copying references/full passage text.
- Introduction, source information and original downloads.
- Back/forward restoration of topic and non-topic reader views.
- Full-book search, punctuation matching and empty results.
- Scripture links opening the working Follow Bible reader in the same tab.
- Print navigation hiding and preserved reading content.
- Mobile menu collapse, reading focus and scrolling under Follow's header,
  without horizontal overflow or runtime errors.