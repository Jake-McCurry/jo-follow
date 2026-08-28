---
name: Article link validation
description: Coverage rule for checks that prevent published article routes from drifting away from the shared catalog.
---

Article catalog validation must cover every user-visible frontend source that can publish an article URL, including global navigation and landing pages, rather than relying on a hand-maintained list of article-focused pages.

**Why:** Article entry links also live outside Explore and XP. Limiting validation to those pages allowed Home or Layout typos to evade the guard.

**How to apply:** When article-link sources change, keep discovery broad enough to include new TypeScript/TSX pages and shared components, and retain a regression case for links outside article index pages.