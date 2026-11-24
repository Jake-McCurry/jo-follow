# Website performance baseline and optimization

Measured on 2026-11-24. These are Lighthouse laboratory measurements, not actual-visitor Core Web Vitals.

## Method

- Lighthouse 13.6.0 and Chromium 155 on the same Linux runner.
- Performance category, standard mobile and desktop presets, fresh browser storage for every audit.
- Mobile simulates 150 ms RTT, 1,638.4 Kbps throughput and 4× CPU slowdown.
- Six representative routes, each tested on mobile and desktop.
- Public baseline: `https://follow.jesusonline.com`, before these changes were published. All twelve document responses were HTTP 200, with no Lighthouse runtime errors.
- Controlled baseline: a saved copy of the current, unchanged production build, served locally with gzip compression.
- Controlled optimized build: the changed production build, served by the identical measurement server with the same compression and API proxy.
- The local baseline includes current unpublished work and is not byte-identical to the older public release. **Do not compare a local optimized timing directly against a public baseline and call it a live improvement.**
- Cold-load tests do not measure the additional benefit of long-lived browser caching.
- Scores and timings vary with third-party analytics, machine load, and network conditions. Each matrix is one audit per page/device, not a statistical median.

## Public-site baseline

| Page | Route | Mobile score | Mobile LCP | Desktop score | Desktop LCP |
| --- | --- | ---: | ---: | ---: | ---: |
| Home | `/` | 48 | 9.33 s | 90 | 2.04 s |
| XP | `/xp/received` | 48 | 6.02 s | 91 | 1.81 s |
| Bible | `/bible/John/3#verse-16` | 51 | 6.21 s | 92 | 1.66 s |
| Knowing God | `/knowing-god` | 45 | 9.43 s | 90 | 1.96 s |
| Promises | `/promises` | 56 | 5.99 s | 97 | 1.22 s |
| Prayer article | `/prayer/what-is-prayer` | 53 | 6.61 s | 97 | 1.24 s |

An earlier exploratory homepage audit measured 44/100 and 10.8 s LCP; the repeated homepage audit in this matrix measured 48/100 and 9.33 s. This is ordinary lab-run variation, not a release change.

## Controlled before/after results

These compare the unchanged and optimized production builds on the same gzip server. Scores are out of 100; LCP is largest-content paint. The final six-page matrix is in `delivery-final`; Bible's subsequent loading/cache fix was checked separately on both devices in `bible-final`. Other rows were not rerun after that Bible-only change. These are measurement labels: nothing was published.

### Mobile

| Page | Score before → after | First content before → after | LCP before → after | Transferred before → after |
| --- | ---: | ---: | ---: | ---: |
| Home | 56 → 72 | 2.77 → 1.10 s | 9.17 → 4.62 s | 1,682,087 → 839,607 bytes |
| XP | 66 → 89 | 1.40 → 1.06 s | 5.74 → 1.06 s | 989,696 → 561,572 bytes |
| Bible, exact verse | 59 → 77 | 1.40 → 2.70 s | 9.24 → 2.70 s | 1,001,802 → 589,790 bytes |
| Knowing God | 63 → 87 | 1.45 → 1.89 s | 6.28 → 1.89 s | 1,033,609 → 633,318 bytes |
| Promises | 65 → 77 | 1.40 → 1.06 s | 5.99 → 3.89 s | 1,005,180 → 627,210 bytes |
| Prayer article | 60 → 89 | 2.67 → 1.06 s | 6.62 → 1.06 s | 990,209 → 590,557 bytes |

### Desktop

| Page | Score before → after | First content before → after | LCP before → after |
| --- | ---: | ---: | ---: |
| Home | 92 → 99 | 0.71 → 0.28 s | 1.78 → 0.86 s |
| XP | 98 → 100 | 0.43 → 0.28 s | 1.17 → 0.28 s |
| Bible, exact verse | 90 → 100 | 0.40 → 0.29 s | 2.07 → 0.29 s |
| Knowing God | 97 → 100 | 0.40 → 0.29 s | 1.26 → 0.29 s |
| Promises | 80 → 83 | 0.41 → 0.29 s | 1.22 → 0.81 s |
| Prayer article | 95 → 100 | 0.73 → 0.29 s | 1.50 → 0.29 s |

### Interpretation and limitations

- Main-content LCP improved on every sampled route on both devices. Mobile improvements were approximately 50% for Home, 82% for XP, 71% for Bible, 70% for Knowing God, 35% for Promises, and 84% for the prayer article.
- Every sampled page transferred less data. The compressed entry script fell from 564,570 to 135,678 bytes, about 76% smaller.
- This does not mean every metric improved: Knowing God's mobile first-content paint was 1.89 s versus 1.45 s, and Bible's was 2.70 s versus 1.40 s. Their main-content LCP nevertheless improved substantially; Bible now paints the prepared reading content without the intermediate layout jump.
- Bible's final focused checks had zero measured layout shift on both devices. The automatic jump to verse 16 remains enabled; it was not removed to improve the score.
- Promises retains a pre-existing desktop layout shift (0.336 after versus 0.337 before). Its 83/100 desktop score is not presented as perfect. Mobile Knowing God and Promises also retain small measured shifts.
- Reading-page screenshots retained their original content and final layout. A matching final screenshot does not prove that intermediate loading is equally fast or stable.
- External analytics/recording remain a substantial CPU cost, but the first-paint tracking-delay experiment did not give consistent benefits. No tracking tags or original startup behavior were removed.
- The first pass regressed XP and article LCP despite smaller downloads. The deeper pass below addresses those regressions through independent article delivery and immediate text visibility; the tables above replace the first-pass results.
- Do not present these measurements as new scores for the public Cloudflare site. No public after-change measurement exists until the changed build is actually live.

## What changed

- The homepage remains directly available; the other sections load their page code on demand.
- Shared URL routing no longer imports every article body. A lightweight catalog handles titles and navigation, while each of the 79 published articles has its own independently loaded body. The original editorial transformations run at build time rather than shipping the complete library to the browser.
- An early production-only preload selects the current route, its code dependencies, and only the requested article body. Canonical and legacy article URLs remain supported; the homepage does not download the article bodies.
- The initial section is prepared before React's first commit, avoiding an extra temporary-layout replacement and restarted entrance animations. Later navigation still has an accessible loading state, without consuming the session's saved-reading offer.
- Initial Bible chapter visits prepare the same translation-specific query cache the reader uses. Preparation is bounded to 800 ms: slow or unavailable APIs still use the original loading/error interface, without silently switching translations. Matching one-minute freshness windows avoid immediately refetching the prepared data. The final audit requested the books list and passage once each. Exact-verse positioning remains intact.
- Primary reading text no longer starts hidden by opacity fades on the shared main container, XP headers/cards, article pages, Bible passages, or the homepage headline. Final typography and layout remain unchanged.
- The original font families, weight ranges, styles, and language subsets are hosted locally with their open-font licenses. The two ordinary Latin fonts preload early, avoiding external-font and late-heading waterfalls.
- The hero and book cover have responsive WebP delivery copies. The homepage hero preloads after viewport metadata so phones select the correct responsive image rather than an unnecessary desktop-sized source. The final mobile audit downloaded one 1600-pixel hero, with no duplicate hero request. Sizing accounts for the wider source needed by the tall mobile `object-cover` crop. Original images and approved crop/text positioning remain intact.
- Nineteen PNG illustrations have lossless WebP copies, checked for identical visible pixels. Already-compressed JPEG illustrations stay in their original format because lossless conversion made them larger.
- Below-fold cover decoding is deferred, with intrinsic dimensions supplied to reserve space.
- Fingerprinted scripts, styles, responsive images, and fonts have long-lived cache headers. Unversioned HTML and font stylesheets revalidate; editable illustration filenames use a short cache lifetime.
- Successful public Bible responses can be reused by URL, including the selected translation. Validation errors and upstream failures remain `no-store`. No private/session response cache policy changed.
- Analytics, recording scripts, all content, all PDFs, all Bible/search corpora, saved items, translation controls, verse anchors, and existing navigation remain available.
- A trial that started Tag Manager after the first paint did not improve results consistently. It was discarded; the original tracking initialization and enabled tags are retained.

The sample prayer article's independently delivered body is 3,244 bytes gzip, not the entire library. Its full-page transfer above still includes fonts, application code, navigation, and unchanged tracking; the body size is not presented as a total page size.

## Verification and reproduction

The first-pass full existing prebuild/source-fidelity tests passed, including both complete Bible corpora, search ordering/filters, original article snapshots, Promises, Bible resources, and PDF byte checks. The deeper pass additionally passed article and Connect-with-God regressions, session-resume tests, Bible-study/verse-positioning tests, type checking, and 14 delivery/performance tests.

All 79 finalized article records and their companion destinations matched an exact snapshot captured before this refactor. Delivery checks cover metadata/body separation, requested-body preloads, duplicate-request suppression, cache reuse, retry/error behavior, canonical/legacy paths, font/image fidelity, and public/error-response caching. Bible preparation tests cover the exact KJV cache key, encoded book names, bounded waiting, and explicit NET failures without a KJV fallback. All final sampled documents returned HTTP 200 with no Lighthouse runtime errors.

The optional pre-refactor snapshot is local generated verification data, not an additional content source. Refresh or remove it when intentionally changing editorial content in future work.

```sh
pnpm run prebuild
pnpm exec vite build
pnpm run test:performance
pnpm run typecheck
```

For an unchanged baseline, copy `dist/public` to `generated-artifacts/performance/baseline-build` before editing application code. From the app directory, run the measurement server and then the audit runner:

```sh
node scripts/performance-server.mjs ../../generated-artifacts/performance/baseline-build 4179
node scripts/measure-performance.mjs baseline http://127.0.0.1:4179

node scripts/performance-server.mjs dist/public 4180
node scripts/measure-performance.mjs final http://127.0.0.1:4180

# Optional focused check after a change limited to one page:
node scripts/measure-performance.mjs bible-check http://127.0.0.1:4180 bible

node scripts/measure-performance.mjs live https://follow.jesusonline.com
```

Run audit matrices sequentially, without builds or other heavy work competing with Chromium. The local API proxy expects the existing API service on port 8080. The helper servers are temporary measurement tools, not replacement application workflows.

Raw JSON audits, screenshots, and the saved baseline build are in the ignored `generated-artifacts/performance` directory. They are excluded from Git and publishing. `docs/performance.md` preserves the readable results. Nothing in this work pushes or publishes the site or updates the Drive change log.
