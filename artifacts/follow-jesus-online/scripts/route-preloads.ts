import type { Plugin } from "vite";
import { ARTICLE_PAGE_PREFIX } from "./article-pages";
import { getArticlePath } from "../src/data/article-routing";

/** Fetch only the current page's split code early, without executing other pages. */
export function routePreloadsPlugin(base: string): Plugin {
  return {
    name: "follow-route-preloads",
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        if (!context.bundle) return;
        const routes: [string, string][] = [
          ["^/xp-pages/?$", "xp-chooser.tsx"],
          ["^/xp/(?:[^/]+/top10|know-[Jj]esus)/?$", "xp-next-steps.tsx"],
          ["^/xp/", "xp-page.tsx"],
          ["^/knowing-god/introduction", "knowing-god/introduction.tsx"],
          ["^/knowing-god", "knowing-god/index.tsx"],
          ["^/promises", "promises/index.tsx"],
          ["^/bible/saved", "bible-saved.tsx"],
          ["^/bible/resources", "bible-resources.tsx"],
          ["^/bible/[^/]+/[^/]+", "bible-reader.tsx"],
          ["^/bible/?$", "bible-landing.tsx"],
          ["^/gf/a-heart-after-god/the-restless-heart", "gf/heart-after-god-intro.tsx"],
          ["^/gf/[^/]+/[^/]+", "gf/reading.tsx"],
          ["^/gf/[^/]+/?$", "gf/book.tsx"],
          ["^/gf/?$", "gf/index.tsx"],
          ["^/(?:videos|rewatch|rewatch-video)(?:/|$)", "rewatch.tsx"],
          ["^/connect-with-god/?$", "connect-with-god.tsx"],
          ["^/message/?$", "message.tsx"],
          ["^/translate/?$", "translate.tsx"],
          ["^/explore-articles/?$", "explore-articles.tsx"],
          ["^/adv1/?$", "adv-index.tsx"],
          ["^/admin/reactions/?$", "admin/reactions.tsx"],
          ["^/(?:prayer|lords-prayer|experiencing-god|because|adv|deeper)(?:/|$)|^/(?:more-|adv-|deeper-)", "article-placeholder.tsx"],
        ];
        const bundle = context.bundle;
        const manifest = routes.flatMap(([pattern, file]) => {
          const chunk = Object.values(bundle).find(item => item.type === "chunk" && item.facadeModuleId?.endsWith(`/src/pages/${file}`));
          if (!chunk || chunk.type !== "chunk") return [];
          const imports = new Set<string>();
          const collect = (filename: string) => {
            if (imports.has(filename)) return;
            const dependency = bundle[filename];
            if (!dependency || dependency.type !== "chunk") return;
            imports.add(filename);
            dependency.imports.forEach(collect);
          };
          collect(chunk.fileName);
          return [[pattern, [...imports].map(filename => `${base}${filename}`)]];
        });
        const articlePages = Object.values(bundle).flatMap(chunk => {
          if (chunk.type !== "chunk" || !chunk.facadeModuleId?.startsWith(ARTICLE_PAGE_PREFIX)) return [];
          const slug = chunk.facadeModuleId.slice(ARTICLE_PAGE_PREFIX.length);
          return [[getArticlePath(slug), `/${slug}`, `${base}${chunk.fileName}`]];
        });
        const hero = Object.values(bundle).flatMap(asset => {
          if (asset.type !== "asset") return [];
          const width = asset.fileName.match(/^optimized-images\/hero-(\d+)-/);
          return width ? [{ width: Number(width[1]), src: `${base}${asset.fileName}` }] : [];
        }).sort((a, b) => a.width - b.width);
        const heroPreload = hero.length
          ? `if(p==="/"){var h=document.createElement("link");h.rel="preload";h.as="image";h.type="image/webp";h.href=${JSON.stringify(hero.at(-1)!.src)};h.imageSrcset=${JSON.stringify(hero.map(image => `${image.src} ${image.width}w`).join(", "))};h.imageSizes="(max-width: 767px) 800px, 100vw";h.fetchPriority="high";document.head.appendChild(h)}`
          : "";
        const script = `(function(){var p=location.pathname.replace(/\\/$/,"")||"/",b=${JSON.stringify(base)};if(b!=="/")p="/"+p.slice(b.length);${heroPreload}function add(h){var l=document.createElement("link");l.rel="modulepreload";l.href=h;l.crossOrigin="anonymous";document.head.appendChild(l)}var r=${JSON.stringify(manifest)};for(var i=0;i<r.length;i++){if(new RegExp(r[i][0]).test(p)){r[i][1].forEach(add);break}}var a=${JSON.stringify(articlePages)};for(var j=0;j<a.length;j++){if(p===a[j][0]||p===a[j][1]){add(a[j][2]);break}}})();`;
        // Responsive image selection must see the mobile viewport first; otherwise
        // the preload can select a desktop-sized source on a phone.
        const viewport = /(<meta\b[^>]*name=["']viewport["'][^>]*>)/i;
        if (!viewport.test(html)) throw new Error("Route preloads require viewport metadata.");
        return html.replace(viewport, `$1<script data-route-preloads>${script}</script>`);
      },
    },
  };
}
