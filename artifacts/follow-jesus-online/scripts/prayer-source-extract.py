"""Independent source extraction for prayer fidelity checks (including image bytes)."""
import hashlib
import io
import json
import re
import sys
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def extract(archive_path):
    documents = {}
    with ZipFile(archive_path) as archive:
        for name in archive.namelist():
            if not name.endswith(".docx"):
                continue
            with ZipFile(io.BytesIO(archive.read(name))) as document:
                root = ElementTree.fromstring(document.read("word/document.xml"))
                relationships = {
                    row.attrib["Id"]: row.attrib["Target"]
                    for row in ElementTree.fromstring(document.read("word/_rels/document.xml.rels"))
                }
                paragraphs = []
                images = []
                for paragraph in root.findall(f".//{W}body//{W}p"):
                    text = "".join(
                        (node.text or "") if node.tag == f"{W}t" else
                        " " if node.tag in {f"{W}tab", f"{W}br", f"{W}cr"} else ""
                        for node in paragraph.iter()
                    )
                    text = re.sub(r"\s+", " ", text).strip()
                    if text:
                        paragraphs.append(text)
                    for blip in paragraph.iter(f"{A}blip"):
                        target = relationships[blip.attrib[f"{R}embed"]]
                        images.append(hashlib.sha256(document.read(f"word/{target}")).hexdigest())
                documents[Path(name).name[:len("2.4.10.000 ")]] = {
                    "paragraphs": paragraphs,
                    "images": images,
                }
    return documents


if __name__ == "__main__":
    print(json.dumps(extract(sys.argv[1]), ensure_ascii=False))
