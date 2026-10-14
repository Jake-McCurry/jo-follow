---
name: Modal exit accessibility
description: Avoid false failures in browser checks after closing animated dialogs.
---

An animated dialog can keep the background page excluded from the accessibility tree until its portal is removed, even when the background is visually visible.

**Why:** A print-view check incorrectly reported a visible topic heading missing immediately after closing the share dialog.

**How to apply:** Wait for dialog removal or restoration of the background accessibility state before querying page headings or other background controls. Sending Escape alone does not establish that the closing transition has completed.
