#!/usr/bin/env python3
"""Import the complete supplied Word book, retaining its original paragraphs."""
import hashlib
import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "attached_assets/God's_Promises_for_Hope_240119_FINAL_13pt_1791064184261.docx"
OUTPUT = Path(__file__).resolve().parents[1] / "public/promises/book.json"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
GROUPS = [
    ("situation", "Promises for Your Situation"),
    ("feelings", "Promises for Your Feelings"),
    ("relationships", "Promises for Your Relationships"),
    ("identity", "Promises for Your Identity"),
    ("future", "Promises for Your Future"),
    ("character", "Promises about God’s Character"),
]
BOOKS = (
    "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|"
    "[123] Samuel|[12] Kings|[12] Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|"
    "Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|"
    "Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|"
    "Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|"
    "(?:[12] )?Corinthians|Galatians|Ephesians|Philippians|Colossians|[12] Thessalonians|"
    "[12] Timothy|Titus|Philemon|Hebrews|James|[12] Peter|[123] John|Jude|Revelation"
)
CITATION = re.compile(
    rf"(?P<reference>(?:{BOOKS})\s+\d+(?:\s*:\s*\d+[ab]?)?(?:[–—-]\d+(?::\d+[ab]?)?)?"
    r"(?:,\s*\d+(?::\d+[ab]?)?(?:[–—-]\d+(?::\d+[ab]?)?)?)*)"
    r"(?:\s*[,;]?\s*(?P<translation>NLT|NIV|NET|HCSB|KJV|TLB|ISV|ESV|NASB|NKJV|AMP))?\s*[.”’\"]*\s*$"
)


def paragraphs():
    with zipfile.ZipFile(SOURCE) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    result = []
    for node in root.findall(f"{W}body/{W}p"):
        text = "".join(
            (child.text or "") if child.tag == W + "t" else "\n" if child.tag == W + "br" else "\t"
            for child in node.iter() if child.tag in (W + "t", W + "br", W + "tab")
        ).strip()
        if not text:
            continue
        style = node.find(f"{W}pPr/{W}pStyle")
        bold = any(item.get(W + "val", "1") not in ("0", "false", "off")
                   for item in node.iter(W + "b"))
        sizes = {item.get(W + "val") for item in node.iter(W + "sz")}
        result.append({
            "text": text, "style": style.get(W + "val") if style is not None else "",
            "heading": bold and "32" in sizes,
            "subheading": bold and ("28" in sizes or "36" in sizes),
        })
    return result


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def append_block(blocks, paragraph, index):
    text = paragraph["text"]
    continuing_quote = (
        blocks and blocks[-1]["kind"] == "paragraph"
        and blocks[-1]["text"].startswith(("“", "‘", '"'))
        and not paragraph["heading"] and not paragraph["subheading"]
        and paragraph["style"] != "Title"
        and not text.startswith(("“", "‘", '"'))
    )
    if blocks and blocks[-1]["kind"] == "paragraph" and (
        text.lstrip().startswith(("—", "–")) or continuing_quote
    ):
        block = blocks[-1]
        block["text"] += "\n" + text
        block["sourceParagraphs"].append(index)
    else:
        kind = "heading" if paragraph["heading"] or paragraph["subheading"] or paragraph["style"] == "Title" else "paragraph"
        block = {"kind": kind, "text": text, "sourceParagraphs": [index]}
        blocks.append(block)
    match = CITATION.search(block["text"])
    if match:
        block.update(kind="passage", reference=match["reference"], translation=match["translation"] or "NET")
        if block["reference"] == "Corinthians 2:12":
            block["bibleReference"] = "1 Corinthians 2:12"
            block["referenceNote"] = "The source prints “Corinthians 2:12” without a book number. The reading link opens 1 Corinthians 2:12."


def main():
    source = paragraphs()
    intro_start = next(i for i, p in enumerate(source) if p["style"] == "Title" and p["text"] == "Hope in God’s Promises")
    starts = []
    for group_id, title in GROUPS:
        prefix = title if group_id != "character" else "Promises About God’s Character"
        index = next(i for i, p in enumerate(source) if i > intro_start and p["style"] == "Title" and p["text"].startswith(prefix))
        starts.append((index, group_id, title, prefix))
    resources_start = next(i for i, p in enumerate(source) if i > starts[-1][0] and p["text"] == "More Resources")
    data = {
        "schemaVersion": 1, "title": "God’s Promises for Hope",
        "sourceTitle": source[0]["text"], "sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "publication": [], "introduction": [], "groups": [], "resources": [],
        "sourceParagraphCount": len(source),
    }
    for i in range(9):
        append_block(data["publication"], source[i], i)
    for i in range(intro_start, starts[0][0]):
        append_block(data["introduction"], source[i], i)
    for position, (start, group_id, title, prefix) in enumerate(starts):
        end = starts[position + 1][0] if position + 1 < len(starts) else resources_start
        group = {"id": group_id, "title": title, "sourceHeading": source[start]["text"],
                 "description": source[start]["text"][len(prefix):].strip(), "sourceParagraph": start,
                 "preamble": [], "topics": []}
        topic = None
        for i in range(start + 1, end):
            paragraph = source[i]
            if paragraph["heading"]:
                topic = {"id": f"{group_id}-{slug(paragraph['text'])}", "title": paragraph["text"],
                         "sourceParagraph": i, "blocks": []}
                group["topics"].append(topic)
            else:
                append_block(topic["blocks"] if topic else group["preamble"], paragraph, i)
        if not group["topics"] or any(not topic["blocks"] for topic in group["topics"]):
            raise ValueError(f"Missing topic content in {title}")
        data["groups"].append(group)
    for i in range(resources_start, len(source)):
        append_block(data["resources"], source[i], i)
    data["counts"] = {
        "groups": len(data["groups"]),
        "topics": sum(len(g["topics"]) for g in data["groups"]),
        "passages": sum(b["kind"] == "passage" for g in data["groups"] for t in g["topics"] for b in t["blocks"]),
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"counts": data["counts"], "groups": [
        {"title": g["title"], "topics": len(g["topics"]), "first": g["topics"][0]["title"],
         "last": g["topics"][-1]["title"]} for g in data["groups"]]}, indent=2))


if __name__ == "__main__":
    main()