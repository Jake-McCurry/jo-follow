import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const workspaceRoot = path.resolve(appRoot, "../..");
const output = path.join(workspaceRoot, "generated-artifacts/follow-xp-main-content");
const sourcePath = path.join(appRoot, "src/pages/xp-page.tsx");
const source = fs.readFileSync(sourcePath, "utf8");
const ast = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const constants = {};
for (const statement of ast.statements) {
  if (!ts.isVariableStatement(statement)) continue;
  for (const declaration of statement.declarationList.declarations) {
    const name = declaration.name.getText(ast);
    if (["XP_CONTENT", "XP_ARTICLE_LINKS"].includes(name)) {
      constants[name] = vm.runInNewContext("(" + declaration.initializer.getText(ast) + ")");
    }
  }
}
if (!constants.XP_CONTENT || !constants.XP_ARTICLE_LINKS) throw new Error("XP source constants not found");
const pages = {};
for (const [type, original] of Object.entries(constants.XP_CONTENT)) {
  pages[type] = {
    ...JSON.parse(JSON.stringify(original)),
    intro: Array.isArray(original.intro) ? [...original.intro] : [original.intro],
    guideText: Array.isArray(original.guideText) ? [...original.guideText] : original.guideText ? [original.guideText] : [],
    questions: original.questions.map(title => {
      const slug = constants.XP_ARTICLE_LINKS[type]?.[title];
      if (!slug) throw new Error("Missing resource for " + type + ": " + title);
      return { title, href: "/" + slug };
    }),
  };
}
if (Object.keys(pages).length !== 4) throw new Error("Expected exactly four XP pages");
fs.mkdirSync(output, { recursive: true });
const write = (relative, data) => {
  const destination = path.join(output, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, data);
};
for (const name of ["README.md", "TRANSFER-PROMPT.md"]) {
  write(name, fs.readFileSync(path.join(scriptDir, "xp-export", name)));
}
for (const name of ["XPContent.tsx", "xp-content.css"]) {
  write("react/" + name, fs.readFileSync(path.join(scriptDir, "xp-export", name)));
}
write("content/xp-content.json", JSON.stringify(pages, null, 2) + "\n");
write("assets/guide-cover.png", fs.readFileSync(path.join(appRoot, "public/guide-cover.png")));

const appRequire = createRequire(path.join(appRoot, "package.json"));
const react = appRequire("react");
const { renderToStaticMarkup } = appRequire("react-dom/server");
const componentPath = path.join(output, "react/XPContent.tsx");
const compilation = ts.transpileModule(fs.readFileSync(componentPath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  reportDiagnostics: true,
});
if (compilation.diagnostics?.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(compilation.diagnostics, {
  getCanonicalFileName: name => name, getCurrentDirectory: () => workspaceRoot, getNewLine: () => "\n",
}));
const componentModule = { exports: {} };
const localRequire = createRequire(componentPath);
vm.runInNewContext(compilation.outputText, {
  exports: componentModule.exports, module: componentModule,
  require: name => name.endsWith(".css") ? {} : name.startsWith("react") ? appRequire(name) : localRequire(name),
  URLSearchParams,
});
const { XPContent } = componentModule.exports;
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const previewScript = `
const RESOURCE_BASE_URL = ""; // Set to the verified Follow origin, or keep local.
const MESSAGE_HREF = ""; // Optional contact override.
for (const link of document.querySelectorAll("[data-resource-path]")) {
  const current = new URL(link.href, location.href);
  link.href = RESOURCE_BASE_URL.replace(/\\/$/, "") + link.dataset.resourcePath + current.search;
}
if (MESSAGE_HREF) document.querySelector("[data-contact-link]").href = MESSAGE_HREF;
else if (RESOURCE_BASE_URL) document.querySelector("[data-contact-link]").href = RESOURCE_BASE_URL.replace(/\\/$/, "") + "/message";
document.querySelector("[data-xp-share]")?.addEventListener("click", async () => {
  const status = document.querySelector("[data-xp-share-status]");
  try {
    if (navigator.share) await navigator.share({ title: document.title, url: location.href });
    else if (navigator.clipboard && isSecureContext) { await navigator.clipboard.writeText(location.href); status.textContent = "Link copied."; }
    else status.textContent = "Copy this page link: " + location.href;
  } catch (error) {
    if (error.name !== "AbortError") status.textContent = "Copy this page link: " + location.href;
  }
});`;

for (const [type, page] of Object.entries(pages)) {
  const markup = renderToStaticMarkup(react.createElement(XPContent, {
    type, resourceBaseUrl: "", guideCoverSrc: "../assets/guide-cover.png",
  }));
  if (/<(?:header|footer|nav)\b/i.test(markup)) throw new Error("Site chrome leaked into " + type);
  const markdown = ["# " + page.title, ...page.intro];
  if (page.guideHeading) markdown.push(
    "## " + page.guideHeading, ...page.guideText,
    "[" + page.guideLabel + "](/adv/begin-the-adventure)",
    "[Prefer to listen?  3 minutes — How God sees you now](/videos/Gods-Vision)",
    "Want to come back easily later?", "Save or Send this page",
  );
  markdown.push("## " + page.questionsTitle, ...page.questions.map(question => "- [" + question.title + "](" + question.href + ")"),
    "## " + (page.contactHeading ?? "We’re Here If You Need Anything"), page.contactText, "[Send a Message](/message)");
  write("content/" + type + ".md", markdown.join("\n\n") + "\n");
  write("previews/" + type + ".html", '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    escape(page.title) + '</title><link rel="stylesheet" href="../react/xp-content.css"></head><body style="margin:0;background:#fffdfb">' +
    markup + "<script>" + previewScript + "</script></body></html>\n");
}

const files = fs.readdirSync(output, { recursive: true }).filter(relative => fs.statSync(path.join(output, relative)).isFile() && relative !== "manifest.json");
write("manifest.json", JSON.stringify({
  title: "Follow XP main-content transfer package",
  exportedAt: new Date().toISOString(),
  sourceFile: "src/pages/xp-page.tsx",
  sourceSha256: createHash("sha256").update(source).digest("hex"),
  routes: Object.keys(pages).map(type => "/xp/" + type),
  included: ["Main content", "Scoped styles", "Guide cover", "React component", "Content JSON and Markdown", "HTML previews", "Transfer instructions"],
  excluded: ["Site header", "Site navigation", "Site footer", "Linked resource pages", "Contact backend", "Analytics and authentication"],
  files: files.map(relative => ({
    path: relative, sha256: createHash("sha256").update(fs.readFileSync(path.join(output, relative))).digest("hex"),
  })),
}, null, 2) + "\n");

const zip = path.join(path.dirname(output), "follow-xp-main-content.zip");
if (fs.existsSync(zip)) fs.unlinkSync(zip);
execFileSync("zip", ["-qr", zip, path.basename(output)], { cwd: path.dirname(output) });
console.log("Exported four XP pages, " + (files.length + 1) + " files: " + zip);
