import fitz
from pathlib import Path

src = Path('attached_assets/Adventure-Guide-Updated-Visible-Links_1789425082937.pdf')
out = Path('.agents/outputs/adventure-guide-updated')
doc = fitz.open(src)
print(f'pages={doc.page_count}')
for page_number in [1, 2, 3, 4, 6, 8, 18, 34]:
    page = doc[page_number - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    path = out / f'page-{page_number}.png'
    pix.save(path)
    print(path)
