---
name: JO EQUIP download verification
description: Distinguish a blocked verification request from a missing external PDF.
---

Use the official JO EQUIP page's PDF download target. A shell request returning HTTP 403 is not enough to conclude that the PDF is missing or the link is incorrect.

**Why:** Official book-download targets returned Cloudflare HTML to container curl requests while a reader proxy retrieved PDF content from some of those same targets. Direct PDF-file URLs on the same site could still succeed.

**How to apply:** Inspect the official download link and use a PDF-capable fetcher when direct HTTP verification is blocked. Report remaining verification limitations honestly; do not guess replacement filenames or claim that every PDF was successfully downloaded.