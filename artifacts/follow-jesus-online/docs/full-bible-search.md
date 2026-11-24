# Knowing God full-Bible search

The existing NET/KJV toggle selects one search corpus at a time. Results retain
three sections: Knowing God topic titles, curated Knowing God passages, and
complete-Bible verse results. Testament/book filters constrain both Scripture
sections, not topic-title matches. Full-Bible results use 20-item Previous/Next
pages; the curated section uses Show more in batches of 25. All Topics versus
Devotional Topics scopes constrain title and curated-passage matches, not the
separate full-Bible corpus. Changing scope resets both result paginations while
retaining loaded Bible data.

## Provenance and rights

- NET: the existing 66 whole-book Bible.org API responses under
  `scripts/data/net-cache`. Every source file's SHA-256 is recorded in the search
  manifest. The API does not expose an edition identifier; do not invent one.
  Official terms checked 2026-11-24:
  https://netbible.com/resources/copyright and
  https://labs.bible.org/api_web_service .
  The published noncommercial electronic/Internet-app grant applies to this free
  ministry search. Only Bible text is included, not translator notes. Each NET
  quotation is marked NET with a link to netbible.org, and the copyright notice
  appears below results. Reassess rights before charging for or commercially
  bundling this text.
- KJV: `eng-kjv.osis.xml` from https://github.com/seven1m/open-bibles ,
  the source specifically recommended by the current bible-api.com reader
  provider. The XML header identifies standardized 1769 text, eBible.org, and
  public-domain rights outside the UK, with a UK Crown printing-rights caveat.
  A canonical-only lossless JSON extraction is retained as
  `scripts/data/full-bible/kjv-verses.json.gz`; its provenance records the original
  XML SHA-256. Headings, notes and deuterocanonical books are not Scripture verses
  and are excluded; added-word text is retained.

## Coverage

KJV has all 31,102 coordinates across the site's 66-book verse bounds. NET has
31,085 nonempty verses. Its 17 absent traditional coordinates are explicit in the
generator and manifest: Matthew 17:21; 18:11; 23:14; Mark 7:16; 9:44; 9:46; 11:26;
15:28; Luke 17:36; 23:17; John 5:4; Acts 8:37; 15:34; 24:7; 28:29; Romans 16:24;
2 Corinthians 13:14. The last is a numbering difference: the NET final
benediction is 13:13. No KJV text is inserted to fill these coordinates.
Source chapter/verse numbering is preserved, and the NET results disclose the
difference. Any newly missing, empty, duplicate, or extra coordinate fails
validation instead of being silently accepted.

## Runtime

Search shards are same-site static assets, at most about 256 KB each before
compression. Each translation has 18 content-hashed shards, about 1.3–1.4 MB
combined with gzip. No database, search API key or external search service is
used. The first nonempty search lazily starts a dedicated worker and loads only
the selected full-Bible corpus. The existing curated topic text remains separate
and can also be loaded for its own results.

The worker validates hashes/counts, normalizes Unicode case/punctuation and
whitespace, supports words and contiguous phrases within verses, and searches
off the main thread. It yields between chunks so stale requests can be cancelled.
The UI debounces typing for 180 ms, hides stale results immediately when query,
translation, filters or page changes, and accepts only the current request's
response. Corpus data is cached for the search view's lifetime. Only one page
of result text crosses back to the main thread. Ordinary browser caching can
reuse content-hashed assets afterward; offline availability is not promised.

## Rebuild and verify

`python3 scripts/generate-full-bible-search.py` rebuilds from retained local
sources, without network access. `--check` verifies exact generated asset bytes
and rejects stale or extra shards. An explicit
`--import-kjv /path/to/eng-kjv.osis.xml` refreshes the KJV source extraction; never
do this as an incidental UI edit.

`pnpm run test:full-bible-search` verifies all coordinates, source/output parity,
hashes, transfer-size ceilings, search normalization, translation differences,
filters, pagination, outside-curated matches and actual worker messages,
including stale-request suppression and failed-load retry. Runner timings are
reported as reproducible CPU checks, not claims about every user's phone or
network speed.
