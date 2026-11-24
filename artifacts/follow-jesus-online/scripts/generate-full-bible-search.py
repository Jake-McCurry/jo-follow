#!/usr/bin/env python3
"""Build small, content-hashed local search shards; never fetch during builds."""
from __future__ import annotations
import argparse
import gzip
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ARTIFACT = Path(__file__).resolve().parents[1]
SOURCE = ARTIFACT / "scripts/data/full-bible"
OUTPUT = ARTIFACT / "public/knowing-god/bible-search"
spec = importlib.util.spec_from_file_location("net_generator", ARTIFACT / "scripts/generate-knowing-god-net.py")
net = importlib.util.module_from_spec(spec)
spec.loader.exec_module(net)
BOOKS = list(net.BOOK_CHAPTERS)
OSIS = "Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev".split()
OMISSIONS = {
    "Matthew": [(17, 21), (18, 11), (23, 14)],
    "Mark": [(7, 16), (9, 44), (9, 46), (11, 26), (15, 28)],
    "Luke": [(17, 36), (23, 17)], "John": [(5, 4)],
    "Acts": [(8, 37), (15, 34), (24, 7), (28, 29)],
    "Romans": [(16, 24)], "2 Corinthians": [(13, 14)],
}
NET_COPYRIGHT = "Scripture quoted by permission. Quotations designated (NET) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. All rights reserved."

def packed(value):
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def import_kjv(path: Path):
    root = ET.parse(path).getroot()
    rows = []
    for element in root.iter():
        if element.tag.rsplit("}", 1)[-1] != "div" or element.get("type") != "book" or element.get("osisID") not in OSIS:
            continue
        book_index = OSIS.index(element.get("osisID"))
        current = None
        chunks = {}
        def walk(node):
            nonlocal current
            tag = node.tag.rsplit("}", 1)[-1]
            if tag in ("note", "title", "header"):
                return
            if tag == "verse":
                if node.get("osisID"):
                    book, chapter, verse = node.get("osisID").split(".")
                    if book != OSIS[book_index]:
                        raise ValueError("Mismatched KJV book")
                    current = (int(chapter), int(verse))
                    if current in chunks:
                        raise ValueError("Duplicate KJV verse")
                    chunks[current] = []
                elif node.get("eID"):
                    current = None
            if current and node.text:
                chunks[current].append(node.text)
            for child in node:
                walk(child)
                if current and child.tail:
                    chunks[current].append(child.tail)
        walk(element)
        for (chapter, verse), text in sorted(chunks.items()):
            rows.append([book_index, chapter, verse, re.sub(r"\s+", " ", "".join(text)).strip()])
    rows.sort(key=lambda row: row[:3])
    validate(rows, "KJV")
    SOURCE.mkdir(parents=True, exist_ok=True)
    (SOURCE / "kjv-verses.json.gz").write_bytes(gzip.compress(packed(rows), mtime=0))
    (SOURCE / "kjv-source.json").write_bytes(packed({
        "provider": "seven1m/open-bibles (the source recommended by bible-api.com)",
        "url": "https://github.com/seven1m/open-bibles/blob/master/eng-kjv.osis.xml",
        "rawSha256": digest(path.read_bytes()),
        "edition": "Standardized 1769 KJV text, eBible.org OSIS source dated 2013-07-08",
        "license": "Public domain outside the United Kingdom; source notes UK Crown printing rights.",
        "licenseUrl": "https://github.com/seven1m/open-bibles#translation-list",
        "extraction": "66 canonical books only; verse text and added-word text retained; headings, notes and deuterocanonical books excluded.",
    }))

def validate(rows, version):
    bounds = json.loads((ARTIFACT / "src/data/bible-verse-counts.json").read_text())["counts"]
    expected = {(b, c + 1, v) for b, chapters in enumerate(bounds) for c, count in enumerate(chapters) for v in range(1, count + 1)}
    if version == "NET":
        expected -= {(BOOKS.index(book), c, v) for book, coordinates in OMISSIONS.items() for c, v in coordinates}
    actual = {tuple(row[:3]) for row in rows}
    if actual != expected or len(actual) != len(rows):
        raise ValueError(f"{version} coverage mismatch: missing={sorted(expected - actual)[:10]}, extra={sorted(actual - expected)[:10]}")
    if any(not isinstance(row[3], str) or not row[3].strip() for row in rows):
        raise ValueError(f"{version}: empty verse text")
    if rows != sorted(rows, key=lambda row: row[:3]):
        raise ValueError(f"{version}: noncanonical order")

def source_rows(version):
    if version == "KJV":
        return json.loads(gzip.decompress((SOURCE / "kjv-verses.json.gz").read_bytes()))
    rows = []
    for bi, book in enumerate(BOOKS):
        raw = json.loads(net.cache_path(book).read_text())
        indexed = net.validate_book_rows(book, raw)
        rows.extend([bi, c, v, text] for (_, c, v), text in sorted(indexed.items()) if text.strip())
    return rows

def build(check=False):
    manifest = {"schemaVersion": 1, "books": BOOKS, "translations": {}}
    outputs = {}
    for version in ("NET", "KJV"):
        rows = source_rows(version)
        validate(rows, version)
        shards, batch, size = [], [], 0
        def flush():
            nonlocal batch, size
            if not batch:
                return
            content = packed(batch)
            sha = digest(content)
            filename = f"{version.lower()}-{len(shards) + 1:02d}.{sha[:12]}.json"
            shards.append({"file": filename, "sha256": sha, "verses": len(batch), "bytes": len(content)})
            outputs[filename] = content
            batch, size = [], 0
        for row in rows:
            row_size = len(packed(row))
            if batch and size + row_size > 256_000:
                flush()
            batch.append(row)
            size += row_size
        flush()
        source = json.loads((SOURCE / "kjv-source.json").read_text()) if version == "KJV" else {
            "provider": "Bible.org official NET API",
            "url": "https://labs.bible.org/api_web_service",
            "edition": "Official API text; API does not expose an edition identifier",
            "licenseUrl": "https://netbible.com/resources/copyright",
            "license": "Free noncommercial Internet application; retain NET labels, linked attribution, and copyright. No translator notes included.",
            "rawBookSha256": {book: digest(net.cache_path(book).read_bytes()) for book in BOOKS},
        }
        manifest["translations"][version] = {
            "bookCount": 66, "verseCount": len(rows), "shards": shards, "source": source,
            "copyright": NET_COPYRIGHT if version == "NET" else "King James Version (KJV). Public domain outside the United Kingdom.",
            "coverageNotes": (
                "NET's main text does not use 17 verse numbers found in KJV. This includes a numbering difference: the final benediction in 2 Corinthians 13 is NET verse 13, not KJV verse 14. Search follows the published NET text and numbering."
                if version == "NET" else ""
            ),
            "omittedTraditionalVerses": [f"{book} {c}:{v}" for book, verses in OMISSIONS.items() for c, v in verses] if version == "NET" else [],
        }
        compressed = sum(len(gzip.compress(outputs[s["file"]], mtime=0)) for s in shards)
        print(f"{version}: {len(rows)} verses; {len(shards)} shards; {compressed:,} gzip bytes")
    outputs["manifest.json"] = packed(manifest)
    if check:
        for filename, content in outputs.items():
            if not (OUTPUT / filename).exists() or (OUTPUT / filename).read_bytes() != content:
                raise ValueError(f"Stale or missing Bible search asset: {filename}")
        if {p.name for p in OUTPUT.glob("*.json")} != set(outputs):
            raise ValueError("Unexpected stale Bible search assets")
    else:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        for stale in OUTPUT.glob("*.json"):
            if stale.name not in outputs:
                stale.unlink()
        for filename, content in outputs.items():
            (OUTPUT / filename).write_bytes(content)
    return manifest

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--import-kjv", type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.import_kjv:
        import_kjv(args.import_kjv)
    build(args.check)
