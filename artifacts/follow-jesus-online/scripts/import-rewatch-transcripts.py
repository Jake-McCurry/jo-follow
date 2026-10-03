"""Extract published video transcripts from the JO App's public content export.

Usage: python scripts/import-rewatch-transcripts.py /tmp/jo-posts.json
       python scripts/import-rewatch-transcripts.py /path/to/supplied-transcripts.docx
Imports merge into existing transcripts; unrelated entries are never removed.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

OUTPUT = Path(__file__).resolve().parents[1] / "src/data/rewatch-transcripts.json"
DOCX_SECTIONS = {
    "psw_5rn9WFY": "Total Life Discipleship Requires God’s Vision",
    "56GWpb0F2qU": "Total Life Discipleship Involves Personal Transformation",
    "Wq2g9GTgc_Q": "Total Life Discipleship Results in Eternal Impact",
}


def docx_paragraphs(source):
    ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    with ZipFile(source) as archive:
        root = ElementTree.fromstring(archive.read("word/document.xml"))
    paragraphs = []
    for paragraph in root.findall(f".//{ns}body//{ns}p"):
        parts = []
        for node in paragraph.iter():
            if node.tag == f"{ns}t":
                parts.append(node.text or "")
            elif node.tag == f"{ns}tab":
                parts.append("\t")
            elif node.tag == f"{ns}br":
                parts.append("\n")
        text = "".join(parts).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def import_docx(source):
    paragraphs = docx_paragraphs(source)
    titles = list(DOCX_SECTIONS.values())
    assert all(paragraphs.count(title) == 1 for title in titles), "Missing or duplicate video section"
    starts = [paragraphs.index(title) for title in titles]
    assert starts == sorted(starts), "Unexpected video section order"
    transcripts = {}
    for index, (video_id, title) in enumerate(DOCX_SECTIONS.items()):
        end = starts[index + 1] if index + 1 < len(starts) else len(paragraphs)
        blocks = [
            {
                "kind": "heading" if text == title or text.startswith(
                    ("God Sees ", "Transformation ", "Eternal Impact ")
                ) else "paragraph",
                "text": text,
            }
            for text in paragraphs[starts[index]:end]
        ]
        assert len(blocks) >= 15, f"Incomplete supplied transcript: {title}"
        transcripts[video_id] = {
            "sourceDocument": source.name,
            "sourceHeading": title,
            "blocks": blocks,
        }
    return transcripts


class TranscriptParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.current_tag = None
        self.parts = []
        self.finished = False

    def handle_starttag(self, tag, attrs):
        if tag in {"p", "h2", "h3", "h4", "li"}:
            self.current_tag = tag
            self.parts = []

    def handle_data(self, data):
        if self.current_tag:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag != self.current_tag:
            return
        text = re.sub(r"\s+", " ", "".join(self.parts)).strip()
        self.current_tag = None
        if text == "What is your response?":
            self.finished = True
        if self.finished or not text or text == "Video Transcript":
            return
        kind = "heading" if tag in {"h2", "h3", "h4"} else "list" if tag == "li" else "paragraph"
        self.blocks.append({"kind": kind, "text": text})


def import_published(source):
    posts = json.loads(source.read_text())["data"]["posts"]
    sources = {
        "SEg4a2xaJyw": "42211-t-jesus-resurrection-and-you",
        "XB7wGTnYeaE": "42216-t-the-gift-of-heaven",
    }
    transcripts = {}
    for video_id, slug in sources.items():
        post = next(post for post in posts if post["slug"] == slug)
        parser = TranscriptParser()
        parser.feed(post["body"])
        assert len(parser.blocks) > 20, f"Incomplete transcript: {slug}"
        transcripts[video_id] = {
            "sourceUrl": f"https://app.jesusonline.com/post/{slug}",
            "blocks": parser.blocks,
        }
    return transcripts


if __name__ == "__main__":
    source = Path(sys.argv[1])
    imported = import_docx(source) if source.suffix.lower() == ".docx" else import_published(source)
    existing = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    existing.update(imported)
    OUTPUT.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + "\n")
    print(f"Imported {len(imported)} transcripts; retained {len(existing)} total in {OUTPUT.name}")