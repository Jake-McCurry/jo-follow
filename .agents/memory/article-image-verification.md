---
name: Article image verification
description: Why new article illustrations need both preview HTTP checks and build-file checks.
---

Verify new article illustrations in both the running preview and the production build. A successful build or a file-on-disk check does not establish that the preview URL serves an image.

**Why:** Article-image middleware can intercept a request before the public-file server. An uploaded illustration can be included in the build while returning a 404 in preview.

**How to apply:** When adding article illustrations, check the preview URL's status and image content type as well as the emitted build file. Preserve explicit errors for genuinely missing images.