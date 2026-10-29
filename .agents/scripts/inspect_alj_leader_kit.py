from pathlib import Path
import pymupdf as fitz

source = Path("attached_assets/1_This_Sunday_Leader_Kit_(ALJ_-_The_Guide)_v.102126_1793299800038.pdf")
out = Path("generated-artifacts/alj-leader-kit")
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(source)
print(f"Source: {source.stat().st_size:,} bytes; {len(doc)} pages")
for index in range(min(3, len(doc))):
    page = doc[index]
    page.get_pixmap(matrix=fitz.Matrix(1, 1)).save(out / f"source-{index + 1}.png")
    print(f"\nPAGE {index + 1}\n{page.get_text()[:4500]}")
print("Images:", sum(len(page.get_images()) for page in doc))
print("Links:", sum(len(page.get_links()) for page in doc))

def signature(document):
    return [
        (page.get_text(), tuple(page.rect), [
            {key: value for key, value in link.items() if key not in ("xref", "id")}
            for link in page.get_links()
        ])
        for page in document
    ]

expected = signature(doc)
for dpi, quality in [(200, 85), (150, 82), (120, 80)]:
    candidate = out / f"leader-kit-{dpi}dpi.pdf"
    with fitz.open(source) as compressed:
        compressed.rewrite_images(dpi_threshold=dpi + 1, dpi_target=dpi, quality=quality, bitonal=False)
        compressed.save(candidate, garbage=4, deflate=True, use_objstms=1, compression_effort=100)
    with fitz.open(candidate) as verified:
        assert signature(verified) == expected, "PDF text, links, or page geometry changed"
    print(f"Candidate {dpi} dpi: {candidate.stat().st_size:,} bytes; text and links unchanged")
    if candidate.stat().st_size <= 2_000_000:
        final = out / "This Sunday Leader Kit - ALJ Guide - v.102126.pdf"
        final.write_bytes(candidate.read_bytes())
        with fitz.open(final) as verified:
            for index in [0, 1, 2, len(verified) - 1]:
                verified[index].get_pixmap(matrix=fitz.Matrix(1.25, 1.25)).save(out / f"optimized-{index + 1}.png")
        print(f"FINAL: {final}")
        break
else:
    raise RuntimeError("No verified candidate under 2 MB")
