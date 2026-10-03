"""Extract published video transcripts from the JO App's public content export.

Usage: python scripts/import-rewatch-transcripts.py /tmp/jo-posts.json
Only explicitly published transcripts are imported, not related study articles.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


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


posts = json.loads(Path(sys.argv[1]).read_text())["data"]["posts"]
sources = {
    "SEg4a2xaJyw": "42211-t-jesus-resurrection-and-you",
    "XB7wGTnYeaE": "42216-t-the-gift-of-heaven",
}
transcripts = {}
for video_id, slug in sources.items():
    source = next(post for post in posts if post["slug"] == slug)
    parser = TranscriptParser()
    parser.feed(source["body"])
    assert len(parser.blocks) > 20, f"Incomplete transcript: {slug}"
    transcripts[video_id] = {
        "sourceUrl": f"https://app.jesusonline.com/post/{slug}",
        "blocks": parser.blocks,
    }

output = Path(__file__).resolve().parents[1] / "src/data/rewatch-transcripts.json"
output.write_text(json.dumps(transcripts, ensure_ascii=False, indent=2) + "\n")
print(f"Imported {len(transcripts)} published transcripts into {output.name}")