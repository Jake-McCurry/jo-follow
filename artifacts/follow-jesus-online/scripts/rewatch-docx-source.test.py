"""Verify the three supplied scripts against their complete Word sections."""
import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("rewatch_import", HERE / "import-rewatch-transcripts.py")
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)
ROOT = HERE.parents[2]
SOURCE = ROOT / "attached_assets/Total_Life_Discipleship_Overview_Videos_(Final)_1791068531153.docx"
DATA = json.loads(importer.OUTPUT.read_text())


class SuppliedTranscriptTests(unittest.TestCase):
    def test_each_complete_source_section_is_present_exactly_once(self):
        paragraphs = importer.docx_paragraphs(SOURCE)
        start = paragraphs.index(next(iter(importer.DOCX_SECTIONS.values())))
        actual = []
        for video_id, heading in importer.DOCX_SECTIONS.items():
            transcript = DATA[video_id]
            self.assertEqual(transcript["sourceDocument"], SOURCE.name)
            self.assertEqual(transcript["sourceHeading"], heading)
            self.assertEqual(transcript["blocks"][0]["text"], heading)
            actual.extend(block["text"] for block in transcript["blocks"])
        self.assertEqual(actual, paragraphs[start:])

    def test_import_is_reproducible_and_preserves_source_wording(self):
        generated = importer.import_docx(SOURCE)
        for video_id, transcript in generated.items():
            self.assertEqual(DATA[video_id], transcript)
        # Preserve printed wording and quotation punctuation without silent edits.
        text = "\n".join(block["text"] for block in DATA["56GWpb0F2qU"]["blocks"])
        self.assertIn('“People look on the outward appearance, but the LORD looks at the heart."”', text)
        self.assertIn("Romans 5:3-4, NLT", text)


if __name__ == "__main__":
    unittest.main()