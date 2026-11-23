"""Import the three approved Word articles; generated JSON/PDFs ship without Python."""
import hashlib
import io
import json
from pathlib import Path
import re
import zipfile
import xml.etree.ElementTree as ET
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[3]
PUBLIC = Path(__file__).resolve().parents[1] / "public/bible-resources"
ARCHIVE = ROOT / "attached_assets/OneDrive_2026-11-23_1795468981376.zip"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
SLUGS = {"001": "inductive-bible-study", "002": "bible-recap", "003": "topical-bible-study"}
IMAGE_PATH = "/bible-resources/images/recap-five-questions.png"
IMAGE_ALT = (
    "R — Is there a REVELATION about God that I should embrace? "
    "Revelation is who God is. Highlight: orange. "
    "E — Is there an EXAMPLE I should follow or avoid? Highlight: light blue. "
    "C — Is there a COMMAND I should obey? Highlight: red. "
    "A — Is there something I need to APPLY to my life? "
    "Application is what this passage asks of you that is not already a command, "
    "an example, or a promise. Highlight: green. "
    "P — Is there a PROMISE I should claim? Highlight: purple."
)


def digest(value):
    return hashlib.sha256(value.encode() if isinstance(value, str) else value).hexdigest()


def source_blocks(data):
    """Read paragraph order, headings, list items and inline image positions."""
    with zipfile.ZipFile(io.BytesIO(data)) as doc:
        document = ET.fromstring(doc.read("word/document.xml"))
        blocks = []
        for p in document.findall("./w:body/w:p", NS):
            text = "".join(t.text or "" for t in p.findall(".//w:t", NS)).strip()
            style = p.find("w:pPr/w:pStyle", NS)
            name = style.get(f"{{{NS['w']}}}val", "") if style is not None else ""
            if text:
                kind = "title" if name == "Heading1" else "heading" if name == "Heading2" else \
                    "list" if p.find("w:pPr/w:numPr", NS) is not None else "paragraph"
                blocks.append((kind, text))
            if p.find(".//w:drawing", NS) is not None:
                blocks.append(("image", IMAGE_ALT))
        image = doc.read("word/media/image1.png") if "word/media/image1.png" in doc.namelist() else None
        return blocks, image


def markdown(blocks):
    output = []
    for kind, text in blocks:
        if kind == "title":
            continue
        if kind == "image":
            output.append(f"![{text}]({IMAGE_PATH})")
        elif kind == "heading":
            output.append("## " + text)
        elif kind == "list":
            output.append("- " + text)
        elif "Read the NET Bible >>>" in text:
            output.append(text.replace("Read the NET Bible >>>", "[Read the NET Bible >>>](/bible/John/1)"))
        elif text.startswith("All Scripture is inspired"):
            output.append("> " + text)
        else:
            output.append(text)
    return "\n\n".join(output)


def make_pdf(blocks, image, destination):
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
    styles = getSampleStyleSheet()
    body = ParagraphStyle("ArticleBody", parent=styles["BodyText"], fontName="Helvetica",
                          fontSize=11, leading=16, spaceAfter=10, textColor=colors.HexColor("#173b4b"))
    heading = ParagraphStyle("ArticleHeading", parent=body, fontName="Helvetica-Bold",
                             fontSize=14, leading=19, spaceBefore=12, keepWithNext=True)
    title = ParagraphStyle("ArticleTitle", parent=heading, fontSize=23, leading=28, spaceAfter=16)
    story = []
    for kind, text in blocks:
        if kind == "image":
            from PIL import Image as PILImage
            with PILImage.open(io.BytesIO(image)) as img:
                width, height = img.size
            story.extend([Image(io.BytesIO(image), width=468, height=468 * height / width), Spacer(1, 10)])
        else:
            html = escape(text)
            if "Read the NET Bible &gt;&gt;&gt;" in html:
                # Relative link remains local when downloaded from this site.
                html = html.replace("Read the NET Bible &gt;&gt;&gt;",
                                    '<link href="/bible/John/1" color="#a94700">Read the NET Bible &gt;&gt;&gt;</link>')
            if kind == "list":
                html = "• " + html
            story.append(Paragraph(html, title if kind == "title" else heading if kind == "heading" else body))
    SimpleDocTemplate(str(destination), pagesize=(612, 792), rightMargin=72, leftMargin=72,
                      topMargin=48, bottomMargin=48, title=blocks[0][1],
                      author="JesusOnline Ministries", pageCompression=1).build(story)


def main():
    catalog_path = PUBLIC / "catalog.json"
    catalog = json.loads(catalog_path.read_text())
    collection = next(c for c in catalog["collections"] if c["id"] == "study-methods")
    with zipfile.ZipFile(ARCHIVE) as archive:
        for number, slug in SLUGS.items():
            name = next(n for n in archive.namelist() if f"2.3.30.{number} " in n)
            data = archive.read(name)
            blocks, image = source_blocks(data)
            article_path = PUBLIC / f"articles/study-methods--{slug}.json"
            article = json.loads(article_path.read_text())
            article["title"] = blocks[0][1]
            article["markdown"] = markdown(blocks)
            article["sourceMarkdown"] = f'# {article["title"]}\n\n{article["markdown"]}'
            article["sourceSha256"] = digest(article["sourceMarkdown"])
            article["contentSha256"] = digest(article["markdown"])
            article["editorialSource"] = {
                "archive": str(ARCHIVE.relative_to(ROOT)), "document": name,
                "sha256": digest(data), "updatedOn": "2026-11-23",
            }
            if image:
                target = PUBLIC / "images/recap-five-questions.png"
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(image)
            pdf_path = ROOT / "artifacts/follow-jesus-online/public" / article["pdf"]["path"].lstrip("/")
            make_pdf(blocks, image, pdf_path)
            pdf = pdf_path.read_bytes()
            article["pdf"].update(sha256=digest(pdf), bytes=len(pdf), generatedFrom="editorialSource")
            assert len(pdf) < 2_000_000
            article_path.write_text(json.dumps(article, ensure_ascii=False, indent=2) + "\n")
            item = next(i for i in collection["items"] if i["id"] == article["id"])
            item["articleTitle"] = article["title"]
            print(f'{article["path"]}: {len(pdf):,} byte PDF')
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
