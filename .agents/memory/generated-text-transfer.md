---
name: Generated text transfer
description: A workspace tooling quirk when transferring large extracted text through CodeExecution.
---

CodeExecution shell output may silently lose content when transferring large text containing PDF form-feed page separators, even when its result does not report truncation. Base64-encoding the entire output was also insufficient at this size; small encoded chunks retained all bytes.

**Why:** A generated Adventure Guide source initially lost page separators and then several pages despite apparently successful shell results. A byte-for-byte hash comparison against the original extraction exposed both incomplete transfers.

**How to apply:** When transferring large generated text through a callback, verify page counts and hashes against the source. If they differ, transfer small encoded chunks and assemble them before saving.