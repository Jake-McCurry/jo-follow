---
name: Staging change log timing
description: When to add project changes to JOLF Change log.
---

The agent makes changes in this workspace; the user pushes them to Git staging. Record what changes were made in the JOLF Change log spreadsheet only after the user's push to Git staging has succeeded.

**Why:** The user asked for this as an ongoing rule and corrected the mistaken assumption that the agent performs pushes: “You never do pushes rememer, youmake chnages in here and then I push to git.”

**How to apply:** Never push for the user. When the user says they pushed to staging, verify the remote staging push if available, then update the spreadsheet from the changes in that push. Do not count uncommitted edits, local-only commits, previews or failed pushes. This chat does not automatically detect the user's later pushes; automatic updates would require separately configured Git-host automation with secure spreadsheet access.
