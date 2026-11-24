---
name: Performance delivery safeguards
description: Preserve Follow's content and appearance while avoiding loading-waterfall and responsive-image regressions.
---

Judge performance changes by page-level production-build measurements, not bundle size alone. Keep the public baseline separate from the controlled local before/after comparison.

**Why:** Splitting the application substantially reduced JavaScript downloads, but early trials still delayed some reading pages through asynchronous initial-layout replacement, animations and font loading. The public release can also differ from current unpublished workspace content.

**How to apply:** Measure representative reading routes as well as the homepage. Prepare only the initial route, keep later navigation lazy, and preserve the session-start resume offer. Do not describe a locally measured improvement as a live-site result before the user has published it.

Keep primary reading text visible from the first content paint rather than fading it in from zero opacity.

**Why:** Nested entrance fades on the main content and reading sections delayed meaningful text painting even after its code and fonts were available. Final screenshots looked unchanged and therefore did not reveal that loading delay.

**How to apply:** Keep final typography and layout intact, and use non-hiding motion where appropriate. Check visibility of the actual reading content, not just the already-painted navigation.

Split article delivery from the finalized editorial assembly, not directly from raw document paragraphs.

**Why:** The approved pages include revision, formatting and link corrections that are not all present in the raw document exports. Moving delivery must not bypass those corrections.

**How to apply:** Preserve the existing assembly transformations at build time, then compare complete rendered-content records and companion destinations against a pre-change snapshot.

Place responsive image preloads after viewport metadata.

**Why:** A preload evaluated before the mobile viewport declaration can select and cache an unnecessarily large desktop source, even when its responsive sizes match the eventual image.

**How to apply:** Keep viewport metadata ahead of responsive preload evaluation and check the actual requested image, not just the declared source set.

Keep exact-verse navigation when improving Bible loading stability.

**Why:** Oversizing the loading placeholder moved the measured shift from the footer to a lower reading panel rather than solving it. Preparing the actual chapter in the existing query cache produced a stable initial view without removing the verse jump.

**How to apply:** Use matching translation-specific query keys and freshness windows for preparation and reader hooks. Test a mounted observer reusing the cache, not just cached-data presence. Bound startup waiting, retain normal loading/error behavior, and verify both final verse position and measured layout shifts.

Keep the approved fonts and their full language coverage. Do not remove analytics or recording merely to improve a score without the user's permission.

**Why:** The user requested keeping everything while making the site faster; external tracking is a material part of its measured startup cost, but disabling it would change existing behavior.

**How to apply:** Preserve font families, weight/style ranges, language subsets and licensing when changing delivery. Report remaining third-party costs rather than silently deleting tracking.

Use lossless delivery for text-bearing article illustrations, and size hero variants for the actual rendered cover dimensions.

**Why:** Lossless JPEG-to-WebP conversions increased transfer size. A tall mobile hero crop needs a wider source than the viewport width; using viewport width alone made the image visibly softer.

**How to apply:** Preserve original source images, compare converted sizes and visible pixels, and retain compressed originals when conversion inflates them. Calculate responsive image sizes from the approved crop without changing its framing.
