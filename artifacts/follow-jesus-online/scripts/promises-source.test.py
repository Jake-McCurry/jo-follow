"""Fidelity checks for the supplied Promises book and its generated reader data."""
import hashlib
import importlib.util
import json
import re
import unittest
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("promises_import", HERE / "import-promises.py")
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)
BOOK = json.loads(importer.OUTPUT.read_text())


class PromisesSourceTests(unittest.TestCase):
    def test_source_checksum_and_original_downloads(self):
        self.assertEqual(BOOK["sourceSha256"], hashlib.sha256(importer.SOURCE.read_bytes()).hexdigest())
        public = importer.OUTPUT.parent
        self.assertEqual((public / "gods-promises-for-hope.docx").read_bytes(), importer.SOURCE.read_bytes())
        pdf = importer.ROOT / "attached_assets/God's_Promises_for_Hope_240119_FINAL_13pt_1791064187061.pdf"
        self.assertEqual((public / "gods-promises-for-hope.pdf").read_bytes(), pdf.read_bytes())

    def test_requested_groups_and_complete_topic_counts(self):
        self.assertEqual([group["title"] for group in BOOK["groups"]], [title for _, title in importer.GROUPS])
        self.assertEqual([len(group["topics"]) for group in BOOK["groups"]], [21, 13, 2, 18, 13, 18])
        topics = [topic for group in BOOK["groups"] for topic in group["topics"]]
        self.assertEqual(len({topic["id"] for topic in topics}), 85)
        self.assertTrue(all(topic["blocks"] for topic in topics))
        self.assertEqual(BOOK["counts"], {"groups": 6, "topics": 85, "passages": 568})

    def test_every_source_paragraph_is_preserved_once_except_print_toc(self):
        source = importer.paragraphs()
        seen = []
        def equal_text(actual, expected):
            self.assertEqual(re.sub(r"\s+", " ", actual).strip(), re.sub(r"\s+", " ", expected).strip())
        def check_blocks(blocks):
            for block in blocks:
                indices = block["sourceParagraphs"]
                equal_text(block["text"], "\n".join(source[i]["text"] for i in indices))
                seen.extend(indices)
        for key in ("publication", "introduction", "resources"):
            check_blocks(BOOK[key])
        for group in BOOK["groups"]:
            index = group["sourceParagraph"]
            equal_text(group["sourceHeading"], source[index]["text"])
            seen.append(index)
            check_blocks(group["preamble"])
            for topic in group["topics"]:
                index = topic["sourceParagraph"]
                equal_text(topic["title"], source[index]["text"])
                seen.append(index)
                check_blocks(topic["blocks"])
        self.assertEqual(sorted(seen), list(range(9)) + list(range(105, len(source))))
        self.assertEqual(len(seen), len(set(seen)))

    def test_original_translations_and_split_quotes(self):
        topics = [topic for group in BOOK["groups"] for topic in group["topics"]]
        passages = [block for topic in topics for block in topic["blocks"] if block["kind"] == "passage"]
        self.assertEqual(Counter(block["translation"] for block in passages),
                         {"NET": 418, "NLT": 138, "NIV": 8, "HCSB": 1, "KJV": 1, "TLB": 1, "ISV": 1})
        long_quote = next(topic for topic in topics if topic["id"] == "identity-all-spiritual-blessings")["blocks"][0]
        self.assertEqual(long_quote["kind"], "passage")
        self.assertIn("For he chose", long_quote["text"])
        self.assertGreater(len(long_quote["sourceParagraphs"]), 1)
        corrected = next(block for block in passages if block["reference"] == "Corinthians 2:12")
        self.assertIn("—Corinthians 2:12", corrected["text"])
        self.assertEqual(corrected["bibleReference"], "1 Corinthians 2:12")
        self.assertTrue(corrected["referenceNote"])


if __name__ == "__main__":
    unittest.main()