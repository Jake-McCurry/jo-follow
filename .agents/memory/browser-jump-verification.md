---
name: Browser jump verification
description: Distinguish an automation activation miss from a broken in-page navigation link.
---

When browser automation reports that a small inline jump link did not scroll, confirm that its handler actually ran before changing more application code.

**Why:** Automated click attempts reported an unchanged viewport even though direct activation of the same visible anchor invoked its handler and correctly positioned the destination beneath the sticky header.

**How to apply:** Confirm activation and measure the destination's viewport coordinates after scrolling settles. A click action being reported as completed is not itself evidence that the intended link was activated; do not repeat broad tests or rewrite working navigation based on that alone.
