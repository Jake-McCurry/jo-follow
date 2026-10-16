"""Check XP copy against all four supplied Word documents."""
import json
import unittest
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

PROJECT = Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[1]
SOURCE = (PROJECT / "src/pages/xp-page.tsx").read_text()
FILES = {
    "believer": "New_XP_Already_Received_Page_261015_1792118358071.docx",
    "rededicated": "New_XP_Rededicated_Page_261015_1792118358071.docx",
    "received": "New_XP_Received_Page_261015_1792118358071.docx",
    "did-not-pray": "New_XP_Did_Not_Pray_Page_261015_1792118358071.docx",
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
                content_source = SOURCE.split("const XP_CONTENT:", 1)[1].split("export function XPPage", 1)[0]
                page_source = content_source.split(f'  "{page}": {{', 1)[1].split("\n  },", 1)[0]
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

    def test_book_cover_and_removed_explanations_are_absent(self):
        self.assertNotIn("<img", SOURCE)
        self.assertNotIn("guideCoverUrl", SOURCE)
        for removed in [
            "This relationship isn't based on fleeting feelings",
            "This short guide will help you understand who you are now",
            "Turning back to Jesus is not about obtaining a second salvation",
            "You don't need to fix everything at once",
            "If you have trusted Christ, you are not a guest",
            "Many believers live as if they were still on trial",
            'guideHeading: "You are still His"',
            'guideHeading: "Already His"',
        ]:
            with self.subTest(removed=removed):
                self.assertNotIn(removed, SOURCE)

    def test_guide_links_do_not_depend_on_removed_headings(self):
        self.assertIn("const hasGuide = Boolean(content.guideLabel)", SOURCE)
        self.assertIn('data-testid="xp-guide-link"', SOURCE)
        self.assertIn('data-testid="xp-listen-link"', SOURCE)
        self.assertLess(SOURCE.index('data-testid="xp-guide-link"'),
                        SOURCE.index("{/* Questions / Next Steps */}"))
        self.assertGreater(SOURCE.index("Want to come back easily later?"),
                           SOURCE.index("{/* Questions / Next Steps */}"))


if __name__ == "__main__":
    unittest.main()
