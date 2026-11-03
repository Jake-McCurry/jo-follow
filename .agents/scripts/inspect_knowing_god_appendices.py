"""Render and extract the supplied Knowing God appendix source pages."""
from pathlib import Path
import fitz
import json
import re

source = Path("attached_assets/ZMission-IngramSpark_03-30-26_260826_1793725505196.pdf")
output = Path("generated-artifacts/knowing-god-appendices")
output.mkdir(parents=True, exist_ok=True)
doc = fitz.open(source)
print(f"PDF pages: {len(doc)}")
for number in (1129, 1131, 1133):
    page = doc[number - 1]
    page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(output / f"page-{number}.png")
    text = page.get_text(sort=True)
    (output / f"page-{number}.txt").write_text(text)
    print(f"\n--- PDF page {number} ---\n{text}")

# Compare each transcription with the original text, allowing only source
# layout whitespace, typographic number markers, and end-of-line hyphenation.
def normalized(text):
    return re.sub(r"\s+", "", re.sub(r"-\s*\n\s*", "", text)).casefold()

data = json.loads(Path("artifacts/follow-jesus-online/src/data/knowing-god/introduction/appendices.json").read_text())
def source_text(number):
    return "\n".join(block[4] for block in doc[number - 1].get_text("blocks"))

def check(value, page, label):
    assert normalized(value) in normalized(source_text(page)), f"Source mismatch: {label}: {value}"

memory = data["memorization"]
check(memory["introduction"], 1131, "introductory paragraph")
for key, value in memory["front"].items():
    if key == "summary":
        # The PDF stores the separate upper-right prompt between these lines.
        for line in value.split(", ", 1):
            check(line, 1131, "front summary")
        continue
    for text in value if isinstance(value, list) else [value]:
        check(text, 1131, f"front {key}")
for key, value in memory["back"].items():
    for text in value if isinstance(value, list) else [value]:
        check(text, 1131, f"back {key}")
assert len(memory["instructions"]) == 7
for i, text in enumerate(memory["instructions"], 1):
    check(text, 1131, f"instruction {i}")
for text in memory["closing"].values():
    check(text, 1131, "closing quotation")
assert len(data["salvationPassages"]) == 21
for passage in data["salvationPassages"]:
    check(f'{passage["reference"]} {passage["text"]}', 1133, passage["reference"])
for key, count in [("notes", 6), ("bibliography", 7), ("resources", 5)]:
    assert len(data[key]) == count
    for item in data[key]:
        check(item.get("before", "") + item["title"] + item["after"], 1129, key)
print("\nAll appendix transcriptions match the supplied PDF source.")
