---
name: One-chapter Bible API responses
description: A verification rule for third-party Bible passage services when handling single-chapter books.
---

When adding or changing a Bible passage provider, verify that chapter requests for Obadiah, Philemon, 2 John, 3 John, and Jude return every verse, not just verse 1. A successful HTTP response and plausible first verse are insufficient checks.

**Why:** One third-party KJV passage service interpreted a request for a single-chapter book followed by "1" as chapter 1, verse 1, while ordinary multi-chapter books returned their full chapters.

**How to apply:** Check all five one-chapter books against their expected verse counts when replacing the provider or changing reference formatting; use an explicit verse range where needed.