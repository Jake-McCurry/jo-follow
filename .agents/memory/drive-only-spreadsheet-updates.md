---
name: Drive-only spreadsheet updates
description: Safely update a simple Google Sheet using the authorized Drive connection when Sheets is not connected.
---

The authorized Drive connection cannot route Google Sheets API requests through its API base. Do not assume a Drive connection is a connected Sheets API client.

**Why:** The Sheets API route returned a not-found response through the Drive proxy, while importing an updated XLSX into the existing native spreadsheet through Drive succeeded without requiring another connection.

**How to apply:** For a simple change log, export the current Drive spreadsheet first, preserve its existing cells/tabs, apply only the intended additions, check that its version has not changed, then update the existing file through Drive's multipart import. Retain the file identity and sharing rather than creating a replacement document. Export again to verify new entries, unchanged historical rows and newest-first ordering. Keep a backup and do not assume this conversion preserves every advanced Sheets feature.
