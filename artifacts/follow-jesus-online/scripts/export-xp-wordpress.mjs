import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = path.resolve(appRoot, "../..");
const output = path.join(workspace, "generated-artifacts/follow-xp-wordpress");
// This is the Follow domain supplied by the user, not the private Replit deployment.
const sourceOrigin = "https://follow.jesusonline.com";
const coverPlaceholder = "REPLACE_WITH_WORDPRESS_GUIDE_COVER_URL";
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
if (!constants.XP_CONTENT || Object.keys(constants.XP_CONTENT).length !== 4 || !constants.XP_ARTICLE_LINKS) {
  throw new Error("Expected the four current XP pages and their question links");
}
fs.mkdirSync(output, { recursive: true });
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const ink = "#003d66";
const muted = "#31566f";
const orange = "#c45100";
const styles = {
  root: `box-sizing:border-box;width:100%;max-width:896px;margin:0 auto;padding:32px 20px;color:${ink};font-family:'Source Sans 3',Arial,sans-serif;font-size:16px;line-height:1.5;text-align:left;`,
  title: `margin:0 0 24px;color:${ink};font-family:'Playfair Display',Georgia,serif;font-size:clamp(34px,5vw,60px);font-weight:700;line-height:1.12;letter-spacing:-0.025em;text-transform:none;`,
  h2: `margin:0 0 20px;color:${ink};font-family:inherit;font-size:24px;font-weight:700;line-height:1.33;letter-spacing:-0.025em;text-transform:none;`,
  intro: `margin:0 0 20px;color:${muted};font-size:20px;line-height:1.625;`,
  paragraph: `margin:0 0 20px;color:${ink};font-size:18px;line-height:1.625;`,
  card: `box-sizing:border-box;background-color:#fffaf6;border:1px solid #ffeadb;border-radius:16px;padding:32px;box-shadow:0 1px 2px rgba(0,0,0,0.05);`,
  button: `box-sizing:border-box;display:inline-block;max-width:100%;padding:16px 24px;background-color:${orange};color:#ffffff;border:0;border-radius:8px;font-family:inherit;font-size:16px;font-weight:600;line-height:1.5;text-align:center;text-decoration:none;white-space:normal;overflow-wrap:break-word;`,
};
const tag = (name, style, text, attributes = "") => `<${name}${attributes} style="${escape(style)}">${text}</${name}>`;
const link = (href, text, style, attributes = "") => tag("a", style, text, ` href="${escape(href)}"${attributes}`);
const paras = (value, style) => (Array.isArray(value) ? value : value ? [value] : []).map(text => tag("p", style, escape(text))).join("\n");

for (const [type, page] of Object.entries(constants.XP_CONTENT)) {
  const route = "/xp/" + type;
  const sections = [];
  sections.push(tag("div", "text-align:center;margin:0 0 64px;",
    '<div aria-hidden="true" style="width:64px;height:4px;margin:0 auto 24px;background-color:#e87722;border-radius:100px;"></div>\n' +
    tag("h1", styles.title, escape(page.title)) +
    (page.subtitle ? paras(page.subtitle, styles.intro) : "") +
    tag("div", "max-width:672px;margin:0 auto;", paras(page.intro, styles.intro))));

  if (page.guideHeading) {
    const originalPage = sourceOrigin + route;
    const emailHref = "mailto:?subject=" + encodeURIComponent(page.title) +
      "&body=" + encodeURIComponent("I found this helpful: " + page.title + "\n\n" + originalPage);
    const guideCopy = tag("h2", styles.h2, escape(page.guideHeading)) +
      paras(page.guideText, styles.paragraph) +
      tag("div", "margin:0 0 32px;", link(sourceOrigin + "/adv/begin-the-adventure",
        escape(page.guideLabel ?? "Begin This Short Guide"), styles.button)) +
      link(sourceOrigin + "/videos/Gods-Vision",
        '<span aria-hidden="true" style="display:inline-block;margin-right:8px;font-size:18px;">&#9654;</span>' +
        '<span>Prefer to listen?  3 minutes &mdash; How God sees you now</span>',
        `color:${orange};font-weight:600;line-height:1.5;text-decoration:none;`);
    const columns = tag("div", "display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:center;gap:40px;margin:0 0 32px;",
      '<img src="' + coverPlaceholder + '" alt="The Adventure of Living with Jesus" style="box-sizing:border-box;display:block;flex:0 1 240px;width:100%;max-width:240px;height:auto;margin:0;border:1px solid #d5dfe5;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);" />\n' +
      tag("div", "flex:1 1 280px;min-width:0;", guideCopy));
    const save = tag("div", `display:flex;flex-wrap:wrap;align-items:center;gap:16px;padding:32px 0 0;border-top:1px solid #ffd3b3;color:${muted};font-size:14px;`,
      "<span>Want to come back easily later?</span>\n" +
      link(emailHref, "Save or Send this page",
        styles.button + "padding:12px 18px;background-color:#ffeadb;color:#663000;font-size:14px;",
        ' title="Send the original Follow page by email"'));
    sections.push(tag("div", styles.card + "margin:0 0 48px;", columns + "\n" + save));
  }

  const questions = page.questions.map(question => {
    const slug = constants.XP_ARTICLE_LINKS[type]?.[question];
    if (!slug) throw new Error("Missing question destination: " + type + ": " + question);
    const params = new URLSearchParams({ journey: type, entry: "direct", from: "xp", step: "faq" });
    return tag("div", styles.card + "display:flex;flex:1 1 300px;min-width:0;align-items:flex-start;gap:16px;padding:24px;border-radius:12px;",
      '<span aria-hidden="true" style="flex:0 0 20px;color:#eea15e;font-size:24px;line-height:1.2;">&#9825;</span>' +
      link(sourceOrigin + "/" + slug + "?" + params.toString(), escape(question),
        `min-width:0;color:${ink};font-size:16px;font-weight:500;line-height:1.5;text-decoration:underline;text-decoration-color:#ffbf80;text-underline-offset:4px;overflow-wrap:break-word;`));
  }).join("\n");
  sections.push(tag("div", "margin:0 0 64px;",
    tag("h2", styles.h2 + "text-align:center;margin-bottom:32px;", escape(page.questionsTitle)) +
    tag("div", "display:flex;flex-wrap:wrap;gap:16px;", questions)));
  sections.push(tag("div", styles.card + "text-align:center;",
    `<div aria-hidden="true" style="margin:0 0 24px;color:${orange};font-size:44px;line-height:1;">&#9993;</div>` +
    tag("h2", styles.h2 + "font-size:30px;margin-bottom:16px;", escape(page.contactHeading ?? "We’re Here If You Need Anything")) +
    tag("div", "max-width:576px;margin:0 auto 32px;", paras(page.contactText, styles.paragraph + `color:${muted};`)) +
    link(sourceOrigin + "/message", "Send a Message", styles.button)));

  const html = "<!-- wp:html -->\n" +
    '<!-- Follow XP main content only. Upload guide-cover.png to WordPress Media and replace the image URL placeholder where present. -->\n' +
    tag("div", styles.root, "\n" + sections.join("\n\n") + "\n", ` data-follow-xp="${type}"`) +
    "\n<!-- /wp:html -->\n";
  if (/<(?:script|style|header|footer|nav|html|head|body)\b|\bclass=|(?:on(?:click|load|error))=/i.test(html)) {
    throw new Error("Non-portable markup in " + type);
  }
  fs.writeFileSync(path.join(output, type + ".html"), html);
  fs.writeFileSync(path.join(output, type + ".txt"), html);
}
fs.copyFileSync(path.join(appRoot, "public/guide-cover.png"), path.join(output, "guide-cover.png"));
fs.copyFileSync(path.join(appRoot, "scripts/xp-export/WORDPRESS-README.txt"), path.join(output, "START-HERE.txt"));
const zip = path.join(path.dirname(output), "follow-xp-wordpress-inline.zip");
if (fs.existsSync(zip)) fs.unlinkSync(zip);
execFileSync("zip", ["-qr", zip, path.basename(output)], { cwd: path.dirname(output) });
console.log("Exported four inline WordPress snippets (.html + .txt), guide artwork and paste instructions: " + zip);
