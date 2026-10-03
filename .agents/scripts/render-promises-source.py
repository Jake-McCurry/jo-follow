"""Render source pages and summarize paragraph overlap for import verification."""
import re
from pathlib import Path
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
pdf = pymupdf.open(ROOT / "attached_assets/God's_Promises_for_Hope_240119_FINAL_13pt_1791064187061.pdf")
for index in [0, 7, 9]:
    path = Path(f"/tmp/promises-source-page-{index + 1}.png")
    pdf[index].get_pixmap().save(path)
    print(path)
print(f"{len(pdf)} source PDF pages")