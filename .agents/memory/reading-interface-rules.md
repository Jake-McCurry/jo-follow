---
name: Reading interface rules
description: Resume-session behavior, eBook availability and safe multi-verse actions.
---

Show “Pick up where you left off…” only at the beginning of a new session, not repeatedly while navigating.

**Why:** The user explicitly requested a session-start reminder instead of a banner on successive pages.

**How to apply:** Treat a session as a browser-tab session; reloads and internal navigation do not restart it. Preserve the saved reading location when the banner is dismissed.

There is no eBook for Building Blocks for Maturity. The other four Go Further book titles should have a plain “Download eBook” line above Contents, not a download panel.

**Why:** The user explicitly distinguished these four titles from Building Blocks for Maturity.

**How to apply:** Do not invent an eBook link for Building Blocks. Use verified book-download destinations.

Multi-verse selections support saving, highlighting and sharing together; notes remain one verse at a time.

**Why:** Applying a shared note across a group could overwrite distinct existing annotations without the reader realizing it.

**How to apply:** Disable note editing for a multi-selection and explain that one verse must be selected. Keep bulk save/highlight operations scoped to the selected verses without altering unrelated saved data.
