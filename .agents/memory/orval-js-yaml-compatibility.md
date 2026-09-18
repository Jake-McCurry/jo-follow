---
name: Orval js-yaml compatibility
description: Compatibility constraint for remediating js-yaml advisories in the API generation toolchain.
---

Use a patched `js-yaml` release that preserves the default export expected by the installed Orval major; do not force a newer incompatible major globally.

**Why:** A clean dependency audit and normal workspace build can still miss an immediate API code-generation failure caused by a transitive module export change.

**How to apply:** When changing the `js-yaml` override or upgrading Orval, run the API-spec code-generation command in addition to the standard build and audit.