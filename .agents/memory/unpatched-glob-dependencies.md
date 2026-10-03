---
name: Unpatched glob dependencies
description: Security rationale for avoiding the external glob chain in component discovery.
---

Do not reintroduce fast-glob/micromatch/braces for component discovery without confirming the braces stack-overflow advisory has a patched release.

**Why:** As of 2026-10-03, GHSA-vfj7-8cjw-p6xm affects every published braces release, including the latest 3.0.3. Updating either parent package cannot remove this vulnerability. Native Node discovery avoids retaining an unpatched dependency for a simple file scan.

**How to apply:** Prefer native file discovery for this use case. If adding a glob library later, check the complete dependency tree and current advisories, not just the direct package version.