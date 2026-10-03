---
name: Development preview file boundaries
description: Why browser-facing Vite file access must be narrower than the pnpm workspace.
---

Keep browser-facing development servers limited to their own UI, required browser
libraries, dependencies, and intentional public media, rather than allowing the
entire pnpm workspace.

**Why:** Vite's default workspace discovery allowed a development-preview HTTP
request to retrieve backend source through `/@fs/`, even though the UI did not
import that source. Development previews still have an HTTP trust boundary.

**How to apply:** When adding an artifact or changing Vite file allowances, verify
that backend and private workspace files are denied through both normal and raw
file requests. Build-time tools reading source documents do not require those
directories to be broadly exposed to HTTP clients. Check browser rendering after
narrowing allowances so legitimate shared UI imports remain available.