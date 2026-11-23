"""Verify revised pages against the actual supplied Word files, not generated snapshots."""
import hashlib
import io
import json
from pathlib import Path
import re
import unittest
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[3]
PUBLIC = Path(__file__).resolve().parents[1] / "public"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


class StudyMethodsSourceTests(unittest.TestCase):
    def test_all_supplied_words_and_graphic_are_preserved(self):
        for slug in ["inductive-bible-study", "bible-recap", "topical-bible-study"]:
            with self.subTest(slug=slug):
                article = json.loads((PUBLIC / f"bible-resources/articles/study-methods--{slug}.json").read_text())
                source = article["editorialSource"]
                with zipfile.ZipFile(ROOT / source["archive"]) as archive:
                    data = archive.read(source["document"])
                self.assertEqual(hashlib.sha256(data).hexdigest(), source["sha256"])
                with zipfile.ZipFile(io.BytesIO(data)) as doc:
                    root = ET.fromstring(doc.read("word/document.xml"))
                    paragraphs = [
                        "".join(t.text or "" for t in p.findall(".//w:t", NS)).strip()
                        for p in root.findall("./w:body/w:p", NS)
                    ]
                    expected = "\n".join(p for p in paragraphs if p)
                    actual = article["title"] + "\n" + article["markdown"]
                    actual = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", actual)
                    actual = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", actual)
                    actual = re.sub(r"^(?:## |\- |>\s)", "", actual, flags=re.M)
                    self.assertEqual(" ".join(expected.split()), " ".join(actual.split()))
                    if slug == "bible-recap":
                        image = PUBLIC / "bible-resources/images/recap-five-questions.png"
                        self.assertEqual(image.read_bytes(), doc.read("word/media/image1.png"))
                        self.assertIn("[Read the NET Bible >>>](/bible/John/1)", article["markdown"])
                        self.assertIn("![R — Is there a REVELATION", article["markdown"])
                self.assertEqual(article["path"], f"/bible/resources/study-methods/{slug}")
                pdf = (PUBLIC / article["pdf"]["path"].lstrip("/")).read_bytes()
                self.assertEqual(hashlib.sha256(pdf).hexdigest(), article["pdf"]["sha256"])
                self.assertLess(len(pdf), 2_000_000)

    def test_soap_source_remains_the_original_import(self):
        article = json.loads((PUBLIC / "bible-resources/articles/study-methods--soap-method.json").read_text())
        self.assertNotIn("editorialSource", article)
        self.assertEqual(article["title"], "The S.O.A.P. Method")


if __name__ == "__main__":
    unittest.main()
