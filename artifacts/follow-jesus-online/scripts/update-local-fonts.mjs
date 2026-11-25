// Explicit maintenance command only; production builds never download fonts.
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const output = new URL("../public/fonts/", import.meta.url);
await mkdir(output, { recursive: true });
const cssUrl = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Source+Sans+3:ital,wght@0,300..900;1,300..900&display=swap";
const response = await fetch(cssUrl, {
  headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" },
});
if (!response.ok) throw new Error(`Font stylesheet: ${response.status}`);
let css = await response.text();
const preloads = [];
for (const match of [...css.matchAll(/\/\* ([^*]+) \*\/\s*(@font-face\s*\{[^}]+\})/g)]) {
  const [, subset, face] = match;
  const url = face.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error("Expected WOFF2 variable font source");
  const family = face.includes("'Playfair Display'") ? "playfair-display" : "source-sans-3";
  const style = face.includes("font-style: italic") ? "italic" : "normal";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font file: ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const filename = `${family}-${subset}-${style}-${hash}.woff2`;
  await writeFile(new URL(filename, output), bytes);
  css = css.replaceAll(url, `./${filename}`);
  if (subset === "latin" && style === "normal") preloads.push(filename);
}
for (const [name, directory] of [["playfair-display", "playfairdisplay"], ["source-sans-3", "sourcesans3"]]) {
  const res = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${directory}/OFL.txt`);
  if (!res.ok) throw new Error(`Font license: ${res.status}`);
  await writeFile(new URL(`${name}-OFL.txt`, output), await res.text());
}
await writeFile(new URL("follow-fonts.css", output), `/* Google Fonts variable editions; same families, styles, weights and language subsets.\n * Source: ${cssUrl}\n * Fonts distributed under their accompanying SIL Open Font Licenses.\n * Regenerate explicitly with: node scripts/update-local-fonts.mjs\n */\n${css}`);
console.log(JSON.stringify({ preloads }, null, 2));
