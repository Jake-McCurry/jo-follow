"""Optimize oversized public PDFs without rasterizing text or changing links.

Requires PyMuPDF. Run without arguments to inspect candidates; --apply installs
verified candidates and keeps originals outside the deployment in generated-artifacts.
"""
import argparse
import json
import shutil
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "artifacts/follow-jesus-online/public"
OUTPUT = ROOT / "generated-artifacts/pdf-optimization"
TARGET = 2_000_000


def content_signature(document):
    return [
        {
            "text": page.get_text(),
            "size": tuple(page.rect),
            "links": [
                {key: value for key, value in link.items() if key not in ("xref", "id")}
                for link in page.get_links()
            ],
        }
        for page in document
    ]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    report = []
    for source in sorted(PUBLIC.rglob("*.pdf")):
        original_size = source.stat().st_size
        entry = {"file": str(source.relative_to(PUBLIC)), "original_bytes": original_size}
        if original_size <= TARGET:
            entry.update(result_bytes=original_size, status="already_under_target")
            report.append(entry)
            continue
        with pymupdf.open(source) as original:
            signature = content_signature(original)
            candidate = None
            for dpi, quality in [(200, 85), (150, 82), (120, 80)]:
                candidate = OUTPUT / f"{source.stem}-{dpi}dpi-q{quality}.pdf"
                with pymupdf.open(source) as document:
                    document.rewrite_images(
                        dpi_threshold=dpi + 1, dpi_target=dpi, quality=quality,
                        bitonal=False,
                    )
                    document.save(
                        candidate, garbage=4, deflate=True, use_objstms=1,
                        compression_effort=100,
                    )
                with pymupdf.open(candidate) as compressed:
                    if content_signature(compressed) != signature:
                        raise RuntimeError(f"Text, links or page geometry changed: {candidate}")
                    for number in [0, 12, original.page_count - 1]:
                        if number >= original.page_count:
                            continue
                        for label, doc in [("original", original), ("optimized", compressed)]:
                            doc[number].get_pixmap(dpi=110).save(
                                OUTPUT / f"{source.stem}-page-{number + 1}-{label}.png"
                            )
                if candidate.stat().st_size <= TARGET:
                    break
            if candidate.stat().st_size > TARGET:
                raise RuntimeError(f"No acceptable under-2-MB candidate for {source}")
            entry.update(
                result_bytes=candidate.stat().st_size,
                candidate=str(candidate.relative_to(ROOT)),
                dpi=dpi, jpeg_quality=quality, pages=original.page_count,
                status="verified_candidate",
            )
        if args.apply:
            backup = OUTPUT / "originals" / source.relative_to(PUBLIC)
            backup.parent.mkdir(parents=True, exist_ok=True)
            if not backup.exists():
                shutil.copy2(source, backup)
            shutil.copy2(candidate, source)
            entry["status"] = "installed"
        report.append(entry)
    (OUTPUT / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
