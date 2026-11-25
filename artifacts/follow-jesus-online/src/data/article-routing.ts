// Keep navigation independent of the full article bodies.
import becauseMetadata from "./because-statements.json";
import lordsPrayerMetadata from "./lords-prayer-articles.json";
import experiencingGodMetadata from "./experiencing-god-articles.json";
import prayerMetadata from "./prayer-articles.json";

export function getArticlePath(slug: string) {
  const because = becauseMetadata.find(article => article.slug === slug);
  if (because) return because.href;
  const lordsPrayer = lordsPrayerMetadata.find(article => article.slug === slug);
  if (lordsPrayer) return lordsPrayer.href;
  const experiencingGod = experiencingGodMetadata.find(article => article.slug === slug);
  if (experiencingGod) return experiencingGod.href;
  const prayer = prayerMetadata.find(article => article.slug === slug);
  if (prayer) return prayer.href;
  if (slug.startsWith("adv-")) return `/adv/${slug.slice("adv-".length)}`;
  if (slug.startsWith("deeper-")) return `/deeper/${slug.slice("deeper-".length)}`;
  return `/${slug}`;
}

export function getArticleSlugFromPath(pathname: string) {
  const because = becauseMetadata.find(article => article.href === pathname.replace(/\/$/, ""));
  if (because) return because.slug;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && segments[0] === "lords-prayer") return "deeper-the-lords-prayer-guide";
  if (segments.length === 2 && segments[0] === "lords-prayer") return `lords-prayer-${segments[1]}`;
  if (segments.length === 2 && segments[0] === "experiencing-god") return `experiencing-god-${segments[1]}`;
  if (segments.length === 1 && segments[0] === "prayer") return "prayer-starter-guide";
  if (segments.length === 2 && (segments[0] === "adv" || segments[0] === "deeper" || segments[0] === "prayer")) {
    return `${segments[0]}-${segments[1]}`;
  }
  return segments.length === 1 ? segments[0] : undefined;
}
