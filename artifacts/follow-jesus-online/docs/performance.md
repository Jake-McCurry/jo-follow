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

These compare the unchanged and optimized production builds on the same gzip server. Scores are out of 100; LCP is largest-content paint. The retained implementation is recorded in the `release` audit directory. The word `release` is only a measurement label: nothing was published.

### Mobile

| Page | Score before → after | First content before → after | LCP before → after | Transferred before → after |
| --- | ---: | ---: | ---: | ---: |
| Home | 56 → 69 | 2.77 → 1.05 s | 9.17 → 4.71 s | 1,682,087 → 836,259 bytes |
| XP | 66 → 64 | 1.40 → 1.05 s | 5.74 → 7.60 s | 989,696 → 558,893 bytes |
| Bible, exact verse | 59 → 54 | 1.40 → 1.07 s | 9.24 → 7.36 s | 1,001,802 → 586,798 bytes |
| Knowing God | 63 → 70 | 1.45 → 1.06 s | 6.28 → 4.88 s | 1,033,609 → 630,637 bytes |
| Promises | 65 → 69 | 1.40 → 1.06 s | 5.99 → 4.87 s | 1,005,180 → 624,703 bytes |
| Prayer article | 60 → 57 | 2.67 → 1.10 s | 6.62 → 9.18 s | 990,209 → 850,708 bytes |

### Desktop

| Page | Score before → after | First content before → after | LCP before → after |
| --- | ---: | ---: | ---: |
| Home | 92 → 99 | 0.71 → 0.28 s | 1.78 → 0.93 s |
| XP | 98 → 91 | 0.43 → 0.28 s | 1.17 → 1.93 s |
| Bible, exact verse | 90 → 91 | 0.40 → 0.29 s | 2.07 → 1.93 s |
| Knowing God | 97 → 99 | 0.40 → 0.29 s | 1.26 → 0.87 s |
| Promises | 80 → 99 | 0.41 → 0.29 s | 1.22 → 0.83 s |
| Prayer article | 95 → 87 | 0.73 → 0.32 s | 1.50 → 2.42 s |

### Interpretation and limitations

- Homepage mobile LCP improved about 49%; its total transfer fell about 50%. Knowing God and Promises also improved in this controlled pass.
- First visible content arrived sooner on every sample page, and all page transfers decreased.
- **This is not yet a uniform site-wide performance win.** XP and prayer-article LCP regressed in these runs, on both devices. Bible's exact-verse page had a better LCP but a worse mobile layout-shift score (0.002 → 0.156), which lowered its overall score. The requested automatic jump to verse 16 still works and was not removed to improve the score.
- Reading-page screenshots retained their original content and final layout. A matching final screenshot does not prove that intermediate loading is equally fast or stable.
- External analytics/recording remain a substantial CPU cost, but the first-paint tracking-delay experiment did not give consistent benefits. No tracking tags or original startup behavior were removed.
- Individual article pages still load the complete article library on demand. Splitting that library into per-article delivery is a remaining optimization opportunity; it was not claimed as implemented.
- Do not present these measurements as new scores for the public Cloudflare site. No public after-change measurement exists until the changed build is actually live.

## What changed

- The homepage remains directly available; the other sections load their page code on demand.
- Shared URL routing no longer imports every article body. Exact article metadata still resolves from the unchanged article library when an article opens.
- An early production-only preload selects the current route and its code dependencies. It does not download all sections on the homepage.
- The initial section is prepared before React's first commit, avoiding an extra temporary-layout replacement and restarted entrance animations. Later navigation still has an accessible loading state, without consuming the session's saved-reading offer.
- The original font families, weight ranges, styles, and language subsets are hosted locally with their open-font licenses. The two ordinary Latin fonts preload early, avoiding external-font and late-heading waterfalls.
- The hero and book cover have responsive WebP delivery copies. Hero sizing accounts for the wider source needed by the tall mobile `object-cover` crop. Original images and approved crop/text positioning remain intact.
- Nineteen PNG illustrations have lossless WebP copies, checked for identical visible pixels. Already-compressed JPEG illustrations stay in their original format because lossless conversion made them larger.
- Below-fold cover decoding is deferred, with intrinsic dimensions supplied to reserve space.
- Fingerprinted scripts, styles, responsive images, and fonts have long-lived cache headers. Unversioned HTML and font stylesheets revalidate; editable illustration filenames use a short cache lifetime.
- Successful public Bible responses can be reused by URL, including the selected translation. Validation errors and upstream failures remain `no-store`. No private/session response cache policy changed.
- Analytics, recording scripts, all content, all PDFs, all Bible/search corpora, saved items, translation controls, verse anchors, and existing navigation remain available.
- A trial that started Tag Manager after the first paint did not improve results consistently. It was discarded; the original tracking initialization and enabled tags are retained.

The first split-code comparison exposed late font/section loading on some mobile pages despite smaller transfers. Early route preloads and local font delivery address that measured waterfall; smaller bundles alone are not sufficient evidence of faster page rendering.

## Verification and reproduction

Full existing prebuild/source-fidelity tests passed, including both complete Bible corpora, search ordering/filters, original article snapshots, Promises, Bible resources, and PDF byte checks. Additional performance tests cover route preloads, navigation aliases, resume-offer preservation, entry-size budgets, local fonts, image fidelity/size, and public versus error-response caching.

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

node scripts/measure-performance.mjs live https://follow.jesusonline.com
```

Run audit matrices sequentially, without builds or other heavy work competing with Chromium. The local API proxy expects the existing API service on port 8080. The helper servers are temporary measurement tools, not replacement application workflows.

Raw JSON audits, screenshots, and the saved baseline build are in the ignored `generated-artifacts/performance` directory. They are excluded from Git and publishing. `docs/performance.md` preserves the readable results. Nothing in this work pushes or publishes the site or updates the Drive change log.
