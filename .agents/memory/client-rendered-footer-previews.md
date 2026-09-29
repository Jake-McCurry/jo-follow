---
name: Client-rendered footer previews
description: How to reliably inspect below-the-fold UI on client-rendered article pages.
---

Fragment URLs in a static app screenshot may still capture the top of a React-rendered page instead of the target footer.

**Why:** The browser can resolve the fragment before React mounts the target section, so the initial scroll has no element to reach. A headless screenshot with the fragment showed the article header even though the footer existed in the final DOM.

**How to apply:** When a screenshot must show an element below the fold, navigate first, wait for client rendering, then locate and scroll the target element into view before capturing. Check that the scroll action actually found the element; don't assume the hash worked.