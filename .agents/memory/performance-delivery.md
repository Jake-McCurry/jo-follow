---
name: Performance delivery safeguards
description: Preserve Follow's content and appearance while avoiding loading-waterfall and responsive-image regressions.
---

Judge performance changes by page-level production-build measurements, not bundle size alone. Keep the public baseline separate from the controlled local before/after comparison.

**Why:** Splitting the application substantially reduced JavaScript downloads, but early trials still delayed some reading pages through asynchronous initial-layout replacement, animations and font loading. The public release can also differ from current unpublished workspace content.

**How to apply:** Measure representative reading routes as well as the homepage. Prepare only the initial route, keep later navigation lazy, and preserve the session-start resume offer. Do not describe a locally measured improvement as a live-site result before the user has published it.

Keep the approved fonts and their full language coverage. Do not remove analytics or recording merely to improve a score without the user's permission.

**Why:** The user requested keeping everything while making the site faster; external tracking is a material part of its measured startup cost, but disabling it would change existing behavior.

**How to apply:** Preserve font families, weight/style ranges, language subsets and licensing when changing delivery. Report remaining third-party costs rather than silently deleting tracking.

Use lossless delivery for text-bearing article illustrations, and size hero variants for the actual rendered cover dimensions.

**Why:** Lossless JPEG-to-WebP conversions increased transfer size. A tall mobile hero crop needs a wider source than the viewport width; using viewport width alone made the image visibly softer.

**How to apply:** Preserve original source images, compare converted sizes and visible pixels, and retain compressed originals when conversion inflates them. Calculate responsive image sizes from the approved crop without changing its framing.
