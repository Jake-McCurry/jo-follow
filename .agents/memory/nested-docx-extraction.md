---
name: Nested DOCX extraction
description: Why ZIP-within-ZIP article imports need an explicit child-process output limit
---

When extracting an entire Word document or embedded media from a parent ZIP with `unzip -p` under Node, set an explicit output buffer larger than the biggest expected file.

**Why:** Node's child-process helpers default to a small stdout buffer. A document with embedded imagery exceeded it and failed with `spawnSync unzip ENOBUFS`, even though the parent archive itself was manageable.

**How to apply:** For future build-time ZIP/DOCX import code, size the buffer against uncompressed inner files or stream extraction; do not rely on archive download size or default `execFileSync` settings.