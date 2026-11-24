import type { Plugin } from "vite";

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
        const script = `(function(){var p=location.pathname,b=${JSON.stringify(base)};if(b!=="/")p="/"+p.slice(b.length);var r=${JSON.stringify(manifest)};for(var i=0;i<r.length;i++){if(new RegExp(r[i][0]).test(p)){r[i][1].forEach(function(h){var l=document.createElement("link");l.rel="modulepreload";l.href=h;l.crossOrigin="anonymous";document.head.appendChild(l)});break}}})();`;
        // Keep the character encoding declaration early, and run before stylesheets.
        return html.replace(/(<meta\b[^>]*charset[^>]*>)/i, `$1<script data-route-preloads>${script}</script>`);
      },
    },
  };
}
