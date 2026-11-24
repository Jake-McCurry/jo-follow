import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Plugin } from "vite";

type SourceImage = { source: Buffer; type: string };
const MODULE = "virtual:optimized-images";

/** Generate smaller delivery copies, never alter the approved source images. */
export function optimizedImagesPlugin(
  root: string,
  base: string,
  articleImages: () => Map<string, SourceImage>,
): Plugin {
  const assets = new Map<string, Buffer>();
  const articleCopies = new Map<string, Promise<Buffer>>();
  let prepared: Promise<Record<string, { src: string; width: number }[]>>;
  const prepare = () => prepared ??= (async () => {
    const groups: Record<string, { src: string; width: number }[]> = {};
    for (const [key, filename, widths] of [
      ["hero", "walking-with-jesus-hero-ankle-crop.jpg", [480, 960, 1600, 2000]],
      ["cover", "guide-cover.png", [240, 480]],
    ] as const) {
      const input = fs.readFileSync(path.join(root, "public", filename));
      groups[key] = [];
      for (const width of widths) {
        const { data, info } = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 88, effort: 5 }).toBuffer({ resolveWithObject: true });
        const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
        const name = `optimized-images/${key}-${info.width}-${hash}.webp`;
        assets.set(name, data);
        groups[key].push({ src: `${base}${name}`, width: info.width });
      }
    }
    return groups;
  })();
  const convertArticle = (name: string) => {
    let promise = articleCopies.get(name);
    if (!promise) {
      promise = (async () => {
        const input = articleImages().get(name)?.source ??
          await fs.promises.readFile(path.join(root, "public/article-images", name));
        // Illustrations can contain small Scripture text. Preserve pixels exactly.
        return sharp(input).webp({ lossless: true, effort: 4 }).toBuffer();
      })();
      articleCopies.set(name, promise);
      promise.catch(() => articleCopies.delete(name));
    }
    return promise;
  };
  return {
    name: "follow-optimized-images",
    resolveId(id) { if (id === MODULE) return `\0${MODULE}`; },
    async load(id) {
      if (id !== `\0${MODULE}`) return;
      return `export default ${JSON.stringify(await prepare())};`;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? "").split("?")[0]);
        const relative = pathname.startsWith(base) ? pathname.slice(base.length) : "";
        try {
          let data: Buffer | undefined;
          if (relative.startsWith("optimized-images/")) {
            await prepare();
            data = assets.get(relative);
          } else if (/^article-images\/[^/]+\.png\.webp$/i.test(relative)) {
            const filename = relative.slice("article-images/".length, -".webp".length);
            if (filename === path.basename(filename)) data = await convertArticle(filename);
          } else return next();
          if (!data) return next();
          res.setHeader("Content-Type", "image/webp");
          res.setHeader("Cache-Control", "public, max-age=3600");
          res.end(data);
        } catch (error) {
          server.config.logger.error(`Image optimization failed: ${String(error)}`);
          res.statusCode = 500;
          res.end("Image optimization failed");
        }
      });
    },
    async generateBundle() {
      await prepare();
      for (const [fileName, source] of assets) this.emitFile({ type: "asset", fileName, source });
      const publicDir = path.join(root, "public/article-images");
      const names = new Set([
        ...[...articleImages().keys()].filter(name => /\.png$/i.test(name)),
        ...(fs.existsSync(publicDir) ? fs.readdirSync(publicDir).filter(name => /\.png$/i.test(name)) : []),
      ]);
      // Sequential conversion avoids competing with Vite for excessive memory.
      for (const name of names) {
        this.emitFile({ type: "asset", fileName: `article-images/${name}.webp`, source: await convertArticle(name) });
      }
    },
  };
}
