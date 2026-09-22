from pathlib import Path

import pymupdf


pdf_path = Path("attached_assets/Color_Palette_1790029646022.pdf")
output_dir = Path(".agents/outputs/brand-kit")
output_dir.mkdir(parents=True, exist_ok=True)

document = pymupdf.open(pdf_path)
for page_number, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False)
    pixmap.save(output_dir / f"page-{page_number + 1}.png")

print(f"Rendered {document.page_count} pages to {output_dir}")