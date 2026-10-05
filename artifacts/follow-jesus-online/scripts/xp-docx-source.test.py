"""Check XP copy against all three supplied Word documents."""
import json
import unittest
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[1]
SOURCE = (PROJECT / "src/pages/xp-page.tsx").read_text()
FILES = {
    "believer": "New_XP_Already_Received_Page_261005_1791236696472.docx",
    "rededicated": "New_XP_Rededicated_Page_261005_1791236698727.docx",
    "received": "New_XP_Received_Page_261005_1791236700785.docx",
}


class XPSourceTests(unittest.TestCase):
    def test_every_supplied_paragraph_matches_its_page(self):
        ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
        for page, filename in FILES.items():
            with self.subTest(page=page):
                with ZipFile(ROOT / "attached_assets" / filename) as archive:
                    root = ElementTree.fromstring(archive.read("word/document.xml"))
                paragraphs = [
                    "".join(node.text or "" for node in p.iter(f"{ns}t")).strip()
                    for p in root.findall(f".//{ns}body/{ns}p")
                ]
                paragraphs = [p for p in paragraphs if p]
                self.assertEqual(paragraphs[0], f"URL: https://follow.jesusonline.com/xp/{page}")
                page_source = SOURCE.split(f'  "{page}": {{', 1)[1].split("\n  },", 1)[0]
                for paragraph in paragraphs[1:]:
                    if paragraph.startswith("Link to:"):
                        self.assertIn(paragraph.split("https://follow.jesusonline.com", 1)[1], SOURCE)
                    elif paragraph.startswith("Prefer to listen?"):
                        self.assertIn(paragraph, SOURCE)
                    else:
                        text = paragraph.removeprefix("<<").removesuffix(">>").strip()
                        self.assertIn(json.dumps(text, ensure_ascii=False), page_source)

    def test_supplied_video_destination_uses_the_matching_video(self):
        app = (PROJECT / "src/App.tsx").read_text()
        self.assertIn('<Route path="/videos/Gods-Vision">', app)
        self.assertIn('<RewatchPage videoId="psw_5rn9WFY" />', app)


if __name__ == "__main__":
    unittest.main()
