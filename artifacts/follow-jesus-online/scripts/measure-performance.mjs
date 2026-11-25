import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [label = "baseline", origin = "http://127.0.0.1:4179", pageFilter] = process.argv.slice(2);
const output = path.resolve("../../generated-artifacts/performance", label);
await mkdir(output, { recursive: true });
const pages = [
  ["home", "/"], ["xp", "/xp/received"], ["bible", "/bible/John/3#verse-16"],
  ["knowing-god", "/knowing-god"], ["promises", "/promises"], ["article", "/prayer/what-is-prayer"],
].filter(([page]) => !pageFilter || pageFilter.split(",").includes(page));
if (!pages.length) throw new Error(`No benchmark pages matched: ${pageFilter}`);
const results = [];
for (const preset of ["mobile", "desktop"]) {
  for (const [page, route] of pages) {
    const file = path.join(output, `${page}-${preset}.json`);
    const args = ["exec", "lighthouse", `${origin}${route}`, "--only-categories=performance",
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
      "--output=json", `--output-path=${file}`, "--quiet", "--no-enable-error-reporting"];
    if (preset === "desktop") args.push("--preset=desktop");
    let error;
    try { execFileSync("pnpm", args, { env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH ?? "/repl/tools/bin/chromium" }, timeout: 120000, stdio: "pipe" }); }
    catch (e) { error = String(e.stderr ?? e.message).slice(-1200); }
    try {
      const report = JSON.parse(await readFile(file, "utf8"));
      const metric = id => report.audits[id]?.numericValue ?? null;
      const result = {
        page, route, preset, fetchedAt: report.fetchTime, url: report.finalDisplayedUrl ?? report.finalUrl,
        lighthouseVersion: report.lighthouseVersion,
        score: report.categories.performance.score,
        fcpMs: metric("first-contentful-paint"), lcpMs: metric("largest-contentful-paint"),
        tbtMs: metric("total-blocking-time"), cls: metric("cumulative-layout-shift"),
        speedIndexMs: metric("speed-index"), transferBytes: metric("total-byte-weight"),
        error: report.runtimeError ?? error ?? null,
        documentStatus: report.audits["network-requests"]?.details?.items?.find(item => item.resourceType === "Document")?.statusCode,
      };
      results.push(result);
      console.log(JSON.stringify(result));
    } catch (e) { results.push({ page, preset, error: error ?? String(e) }); }
    await writeFile(path.join(output, "summary.json"), JSON.stringify(results, null, 2));
  }
}
