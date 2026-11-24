// Local production-build measurement host, never used as a deployed service.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve(process.argv[2] ?? "dist/public");
const port = Number(process.argv[3] ?? 4179);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2", ".pdf": "application/pdf" };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      const upstream = await fetch(`http://127.0.0.1:8080${url.pathname}${url.search}`);
      res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") ?? "application/json" });
      res.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    }
    let file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (!file.startsWith(`${root}/`) && file !== root) throw new Error("Invalid path");
    try { if (!(await stat(file)).isFile()) file = path.join(root, "index.html"); }
    catch { file = path.join(root, "index.html"); }
    const data = await readFile(file);
    const type = types[path.extname(file)] ?? "application/octet-stream";
    const compress = /text\/|json|svg/.test(type) && req.headers["accept-encoding"]?.includes("gzip");
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache", ...(compress ? { "Content-Encoding": "gzip" } : {}) });
    res.end(compress ? gzipSync(data) : data);
  } catch {
    res.writeHead(500); res.end("Measurement server error");
  }
}).listen(port, "127.0.0.1", () => console.log(`Production measurement server on ${port}: ${root}`));
