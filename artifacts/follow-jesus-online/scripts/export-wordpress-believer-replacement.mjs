import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const source = path.join(workspace, "generated-artifacts/follow-xp-wordpress-exact/received.html");
const output = path.join(workspace, "generated-artifacts");
const snippet = fs.readFileSync(source, "utf8");
assert.match(snippet, /He heard you\. You are His\./);
assert.match(snippet, /Something real has begun\./);
assert.doesNotMatch(snippet, /You already belong to Him\.|Already His|Many believers live/);
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const basename = "wordpress-believer-replacement-received-content";
// The destination is the user's WordPress Believer page, but the confirmed
// source is the entire Received page. Do not change the source or its links.
fs.writeFileSync(path.join(output, basename + ".txt"), snippet);
fs.writeFileSync(path.join(output, basename + ".html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WordPress Believer replacement — Received content</title></head>
<body style="max-width:960px;margin:32px auto;padding:0 20px;font-family:Arial,sans-serif;color:#003d66">
<h1>Replacement for your WordPress Believer page</h1>
<p>This is the entire <strong>/xp/received</strong> content, as requested. It begins <strong>“He heard you. You are His.”</strong></p>
<p>In the WordPress page’s Code editor, replace the previous XP content block—not your site header or footer—with everything inside this box. Click inside the box, select all, and copy.</p>
<label for="code"><strong>Complete replacement HTML with inline CSS:</strong></label>
<textarea id="code" readonly spellcheck="false" wrap="off" style="box-sizing:border-box;display:block;width:100%;height:65vh;margin-top:12px;padding:16px;font-family:monospace;font-size:14px;border:2px solid #c45100">${escape(snippet)}</textarea>
</body></html>
`);
assert.equal(fs.readFileSync(path.join(output, basename + ".txt"), "utf8"), snippet);
console.log("Created Believer replacement from Received content, unchanged: " + basename);
