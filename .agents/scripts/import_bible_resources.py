"""Finalize the one-time Equip import; production never contacts Equip.

Source Markdown was captured with the web content extractor. Keep that snapshot
alongside the display body to make later fidelity audits reproducible.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "artifacts/follow-jesus-online/public/bible-resources"
CAPTURE = ROOT / "generated-artifacts/bible-resources"
ARGUMENTS = argparse.ArgumentParser()
ARGUMENTS.add_argument("--download-pdfs", action="store_true")
ARGS = ARGUMENTS.parse_args()

def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()

inventory = json.loads((CAPTURE / "source-inventory.json").read_text())
results = json.loads((CAPTURE / "import-results.json").read_text())
records = {item["sourceUrl"]: item for item in results["imported"]}
all_articles = []
issues = []
for collection in inventory["collections"]:
    for index, item in enumerate(collection["items"]):
        if not item["sourceUrl"]:
            # The creator explicitly confirmed these three lessons are coming soon.
            item.update(id=f'{collection["id"]}--coming-soon-{index}',
                        status="coming-soon",
                        issue="The source owner confirmed this lesson is coming soon.",
                        path=None)
            issues.append({"collectionId": collection["id"], "title": item["title"],
                           "sourceUrl": collection["sourceUrl"],
                           "localDestination": None, "status": "coming-soon", "note": item["issue"]})
            continue
        result = records.get(item["sourceUrl"])
        if not result:
            item.update(status="blocked", path=None, issue="A complete source export is required.")
            issues.append(item.copy())
            continue
        article = json.loads((PUBLIC / "articles" / f'{result["id"]}.json').read_text())
        article["sourceSha256"] = digest(article["sourceMarkdown"])
        article["contentSha256"] = digest(article["markdown"])
        slug = item["sourceUrl"].rsplit("/", 1)[-1]
        if collection["id"] == "survey-nt" and slug in ("philippians", "colossians"):
            article["issues"].append(
                f'The source collection labels this lesson “{item["title"]}” but links it to '
                f'the URL ending “{slug}”. The original title, destination mapping and text '
                "are retained for review; this import does not silently swap the lessons.")
        if collection["id"] == "survey-nt" and slug == "1-thessalonians":
            article["issues"].append(
                "The source's 1 Thessalonians URL displays a 2 Thessalonians heading. "
                "The supplied body is retained without substituting or duplicating another lesson.")
        article["issues"] = list(dict.fromkeys(article["issues"]))
        if article["issues"]:
            issues.append({"sourceUrl": article["sourceUrl"], "localDestination": article["path"],
                           "status": "imported-with-source-inconsistency",
                           "note": " ".join(article["issues"])})
        item.update(id=article["id"], status="imported", articleTitle=article["title"])
        if collection["id"] == "survey-nt" and slug == "colossians":
            item.update(status="coming-soon", path=None,
                        issue="The source's Philippians lesson contains only Coming Soon.")
            article["importStatus"] = "coming-soon"
            issues.append({"sourceUrl": article["sourceUrl"], "localDestination": None,
                           "status": "coming-soon", "note": item["issue"]})
        elif collection["id"] == "survey-nt" and slug == "1-thessalonians":
            item.update(status="blocked", path=None,
                        issue="Source review needed: this link displays the 2 Thessalonians lesson, not 1 Thessalonians.")
            article["importStatus"] = "source-review"
        else:
            article["importStatus"] = "imported"
        all_articles.append(article)
        save(PUBLIC / "articles" / f'{article["id"]}.json', article)

# The source lists "Follow Me" twice in Hearing the Voice of God. Preserve both
# menu positions, but reuse the same article rather than inventing a new lesson.
all_articles = list({article["id"]: article for article in all_articles}.values())
issues.append({
    "sourceUrl": "https://equip.jesusonline.com/categories/growth/hearing-voice-god",
    "localDestination": "/bible/resources/hearing-god",
    "status": "source-duplicate-reused",
    "note": "Follow Me appears twice in the source collection. Both list positions link to one local article; 124 source entries represent 123 unique articles."
})

def download(article):
    pdf = article["pdf"]
    if not pdf.get("sourceUrl"):
        return
    destination = PUBLIC / "pdfs" / f'{article["id"]}.pdf'
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and destination.read_bytes().startswith(b"%PDF-"):
        data = destination.read_bytes()
    elif ARGS.download_pdfs:
        parsed = urlparse(pdf["sourceUrl"])
        if parsed.scheme != "https" or parsed.hostname != "equip.jesusonline.com" or not parsed.path.startswith("/articles/"):
            raise ValueError(f'Unexpected PDF URL: {pdf["sourceUrl"]}')
        with tempfile.TemporaryDirectory() as temporary:
            target = Path(temporary) / "source.pdf"
            request = subprocess.run(
                ["curl", "-sSL", "--fail", "--max-time", "45", "--retry", "1",
                 "--max-filesize", "2097152", "-o", str(target), pdf["sourceUrl"]],
                capture_output=True)
            data = target.read_bytes() if target.exists() else b""
            if request.returncode or not data.startswith(b"%PDF-"):
                pdf.update(status="blocked", issue="The original PDF could not be retrieved unchanged; a source PDF export is needed.")
                return
            # Small, unchanged source documents are normal static project assets.
            # Do not put any large downloads into Git or recompress source PDFs.
            destination.write_bytes(data)
    else:
        return
    pdf.update(status="available", path=f'/bible-resources/pdfs/{article["id"]}.pdf',
               sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))
    save(PUBLIC / "articles" / f'{article["id"]}.json', article)

with ThreadPoolExecutor(max_workers=6) as executor:
    list(executor.map(download, all_articles))

for article in all_articles:
    save(PUBLIC / "articles" / f'{article["id"]}.json', article)
    if article["pdf"].get("status") == "blocked":
        issues.append({"sourceUrl": article["pdf"]["sourceUrl"], "localDestination": None,
                       "status": "pdf-source-needed", "note": article["pdf"]["issue"]})
    item = next(i for c in inventory["collections"] for i in c["items"] if i.get("id") == article["id"])
    if article["pdf"].get("path"):
        item["pdfPath"] = article["pdf"]["path"]

ebook = PUBLIC / "pdfs/gods-promises-for-a-new-year.pdf"
supplemental_pdfs = [{
    "sourceUrl": "https://jesusonline.com/pdf_c/jom/Gods_Promises_for_a_new_year.pdf",
    "path": "/bible-resources/pdfs/gods-promises-for-a-new-year.pdf",
    "sha256": hashlib.sha256(ebook.read_bytes()).hexdigest(),
    "bytes": ebook.stat().st_size,
    "note": "Original 73-page source eBook, unchanged; exceeds the preferred 2 MB target to honor source-PDF fidelity."
}] if ebook.exists() else []
catalog = {"schemaVersion": 1, "importedOn": "2026-11-03", "supplementalPdfs": supplemental_pdfs,
           "collections": inventory["collections"], "issues": issues,
           "permissions": [
               "Original text and Scripture translation labels are retained.",
               "Joshua Nations acknowledgments and attribution links are retained.",
               "Third-party republication permissions must be confirmed by the project owner; public availability alone is not a license."
           ]}
save(PUBLIC / "catalog.json", catalog)
report = {"collections": len(catalog["collections"]),
          "articles": sum(a["importStatus"] == "imported" for a in all_articles),
          "capturedSourceArticles": len(all_articles),
          "comingSoon": sum(i["status"] == "coming-soon" for c in catalog["collections"] for i in c["items"]),
          "availablePdfs": sum(a["pdf"]["status"] == "available" for a in all_articles),
          "pdfBytes": sum(a["pdf"].get("bytes", 0) for a in all_articles),
          "largestPdfBytes": max(a["pdf"].get("bytes", 0) for a in all_articles),
          "issues": issues}
save(CAPTURE / "final-report.json", report)

lines = ["# Bible Resources import inventory", "",
         "Imported November 3, 2026. This is a one-time local content snapshot, not a runtime scraper.",
         "", "Knowing God and the existing topical Promises reader are reused, not duplicated.",
         "The additional Equip Promises article collection is imported separately in its original order.",
         "", "## Verification and permissions", "",
         "Every article stores its complete captured source Markdown, display body, and SHA-256 checksums.",
         "PDF copies are downloaded unchanged and hashed; no PDF is recompressed.",
         "The creator confirmed Ezra and Nehemiah, Song of Songs, and Jeremiah are coming soon.",
         "The public Philippians page also says Coming Soon and is not offered as a completed lesson.",
         "The 1 Thessalonians body duplicates the 2 Thessalonians body; its list entry is held for source review, not rendered as a second lesson.",
         "Hearing the Voice of God lists Follow Me twice. Both original menu positions are retained, pointing to a single local article (123 unique articles across 124 entries).",
         "The linked source eBook PDF is hosted unchanged at 2.79 MB; the individual article PDFs are each under 311 KB.",
         "The source lists Philippians/Colossians under reversed URL slugs and exposes a 2 Thessalonians heading at its 1 Thessalonians URL. These are flagged, not silently repaired.",
         "Joshua Nations credits are retained. The owner should confirm any third-party republication permissions before publication.",
         "", "## Source-to-local inventory", "",
         "| Source URL | Local destination | Status | Notes |", "|---|---|---|---|"]
for collection in catalog["collections"]:
    lines.append(f'| {collection["sourceUrl"]} | {collection["path"]} | imported collection | {collection["title"]} |')
    for item in collection["items"]:
        article = next((a for a in all_articles if a["id"] == item.get("id")), None)
        note = " ".join(article["issues"]) if article else item.get("issue", "")
        note = note.replace("|", "\\|").replace("\n", " ")
        lines.append(f'| {item.get("sourceUrl") or collection["sourceUrl"]} | {item.get("path") or "—"} | {item["status"]} | {item["title"]}: {note} |')
lines += ["", "## Summary", "",
          f'{report["articles"]} full articles; {report["availablePdfs"]} unchanged local source PDFs; {report["comingSoon"]} coming-soon entries. The 1 Thessalonians source is withheld from article navigation pending source review.',
          "", "## Other source issues", ""]
for issue in issues:
    lines.append(f'- {issue.get("sourceUrl", "")}: {issue.get("note", "")}')
doc = ROOT / "artifacts/follow-jesus-online/docs/bible-resources-import.md"
doc.parent.mkdir(parents=True, exist_ok=True)
doc.write_text("\n".join(lines) + "\n")
print(json.dumps({key: val for key, val in report.items() if key != "issues"}, indent=2))
