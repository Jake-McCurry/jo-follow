import library from "./article-library.json";
import importedDeeperArticles from "./imported-deeper-articles.json";
import linkedArticleMetadata from "./linked-articles.json";
import faqReadingLinks from "./faq-reading-links.json";
import prayerMetadata from "./prayer-articles.json";
import { applyBelieverResourceRevisions } from "./believer-resource-revisions";
import { applyGuideMainFormatRevisions } from "./guide-main-format-revisions";
import { applyGuideDeeperFormatRevisions } from "./guide-deeper-format-revisions";
import {
  applyFaqContentRevisions,
  isRemovedFaqContent,
  redirectRetiredFaqReading,
  shouldAppendFaqRelatedLink,
} from "./faq-content-revisions";
import generatedContent from "virtual:article-content";

export type ArticleGroup =
  | "adventure"
  | "deeper"
  | "resources"
  | "received"
  | "rededicated"
  | "believer"
  | "no-decision"
  | "linked"
  | "prayer";

export type ArticleBlock = {
  type: "heading" | "paragraph" | "question" | "list" | "table-row" | "link" | "image" | "answer-line";
  text: string;
  headingLevel?: 2 | 3;
  bold?: boolean;
  boldPhrases?: string[];
  presentation?: "story";
  href?: string;
  src?: string;
  links?: { label: string; href: string }[];
};

export type ArticleContinuation = {
  label: string;
  href: string;
};

export type Article = {
  slug: string;
  title: string;
  group: ArticleGroup;
  order: number;
  excerpt: string;
  blocks: ArticleBlock[];
  retired?: boolean;
  relatedSlug?: string;
  continuation?: ArticleContinuation;
};

const updatedBySlug = new Map(
  generatedContent
    .filter((record) => record.category === "ZIP Updated")
    .map((record) => [record.route.slice(1), record]),
);

function isApprovedFaq(article: Article) {
  return article.group === "received" || article.group === "rededicated" ||
    article.group === "believer" ||
    (article.group === "no-decision" && [0, 2, 4].includes(article.order));
}

function revisedFaqBlocks(
  source: (typeof generatedContent)[number],
  original: ArticleBlock[],
): ArticleBlock[] {
  const route = source.route.slice(1);
  const readingLinks = (faqReadingLinks as Record<string, { label: string; href: string }[]>)[route] ?? [];
  const sourceBlocks = applyBelieverResourceRevisions(route, applyFaqContentRevisions(route, source.blocks))
    .filter((block) => !/^_+$/.test(block.text.trim()));
  const hasExplicitMessageLink = sourceBlocks.some((block) =>
    block.text.trim().toLowerCase() === "send a message" &&
    block.links?.some((link) => {
      const href = link.href.replace(/^https:\/\/follow\.jesusonline\.com(?=\/)/i, "");
      return href === "/message";
    }),
  );
  const matched = new Set<string>();
  const blocks: ArticleBlock[] = [];
  for (const [index, block] of sourceBlocks.entries()) {
    if (index === 0 && block.text.trim() === source.title) continue;
    if (isRemovedFaqContent(route, block.text)) continue;
    const asksForMessage = /write it in the box below|send us (?:your|a|the)|contact us|write to us/i.test(block.text);
    const text = block.text
      .replace(/write it in the box below/gi, (match) =>
        `${match[0] === "W" ? "Send" : "send"} us a message through the contact page`)
      .replace(/\s*>{3}\s*$/, "")
      .trim();
    const links = block.links?.map((link) => ({
      ...link,
      label: link.label.replace(/\s*>{3}\s*$/, "").trim(),
      href: redirectRetiredFaqReading(
        link.href.replace(/^https:\/\/follow\.jesusonline\.com(?=\/)/i, ""),
      ),
    })) ?? [];
    for (const reading of readingLinks) {
      if (!text.includes(reading.label)) continue;
      matched.add(reading.label);
      if (!links.some((link) => link.label === reading.label)) {
        links.push({ ...reading, href: redirectRetiredFaqReading(reading.href) });
      }
    }
    blocks.push({
      type: block.kind,
      text,
      ...(block.headingLevel ? { headingLevel: block.headingLevel } : {}),
      src: block.src,
      ...(links.length ? { links: links.sort((a, b) => text.indexOf(a.label) - text.indexOf(b.label)) } : {}),
    });
    if (asksForMessage && !hasExplicitMessageLink) {
      blocks.push({ type: "link", text: "Send a message", href: "/message" });
    }
  }
  for (const reading of readingLinks) {
    if (!matched.has(reading.label)) {
      throw new Error(`FAQ ${source.route} no longer contains reading suggestion "${reading.label}"`);
    }
  }
  const linkedHrefs = new Set(blocks.flatMap((block) => block.links?.map((link) => link.href) ?? []));
  const visibleSourceText = sourceBlocks.map((block) =>
    block.text.replace(/\s*>{3}\s*$/, "").trim(),
  );
  blocks.push(...original
    .filter((block) =>
      block.type === "link" &&
      block.href &&
      !linkedHrefs.has(block.href) &&
      !isRemovedFaqContent(route, block.text) &&
      visibleSourceText.some((text) => text.includes(block.text.replace(/\s*>{3}\s*$/, "").trim())),
    )
    .map((block) => ({
      ...block,
      href: redirectRetiredFaqReading(
        block.href!.replace(/^https:\/\/follow\.jesusonline\.com(?=\/)/i, ""),
      ),
    })));
  return blocks;
}

const linkedFromFaq = new Map(
  linkedArticleMetadata.map(({ faqSlug, slug, title }) => [
    faqSlug,
    { text: `Read more: ${title}`, href: `/${slug}` },
  ]),
);

const linkedArticles: Article[] = generatedContent
  .filter((record) => record.category === "Linked only")
  .map((record, order) => ({
    slug: record.route.slice(1),
    title: record.title,
    group: "linked",
    order,
    excerpt: record.blocks.find((block) => block.kind === "paragraph" && block.text !== record.title)?.text
      ?? "A Follow Jesus Online resource.",
    blocks: record.blocks
      .filter((block, index) => !(index === 0 && block.text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() === record.title.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()))
      .map((block) => ({ type: block.kind, text: block.text, src: block.src, links: block.links })),
  }));

const adventureCompanions: Record<string, string> = {
  "adv-begin-the-adventure": "deeper-the-need-for-a-new-heart",
  "adv-citizen-of-heaven": "deeper-the-gift-of-eternal-life",
  "adv-your-new-identity-christ": "deeper-embracing-your-new-identity-in-christ",
  "adv-the-holy-spirit": "deeper-living-an-empowered-life",
  "adv-walking-by-faith": "deeper-faith-knowing-god-who-is-trustworthy",
  "adv-gods-word": "deeper-renewing-the-mind-for-transformation",
  "adv-prayer": "deeper-the-lords-prayer-guide",
  "adv-belonging-to-gods-family": "deeper-belong-and-become",
  "adv-living-a-life-of-purpose": "deeper-gods-plan-for-you",
  "adv-continuing-with-jesus": "deeper-your-journey-continues",
};

const importedDeeperBySlug = new Map(
  importedDeeperArticles.map((article) => [article.slug, article]),
);

const importedDeeperRecords: Article[] = generatedContent
  .filter((record) => record.category === "ZIP Updated" && importedDeeperBySlug.has(record.route.slice(1)))
  .map((record) => {
    const metadata = importedDeeperBySlug.get(record.route.slice(1))!;
    const blocks: ArticleBlock[] = record.blocks
      .filter((block) => {
        const text = block.text.trim();
        return (
          text !== "JesusOnline FOLLOW" &&
          !/^Go Deeper\s*·/.test(text) &&
          !/^Your Journey Continues\s*·/.test(text) &&
          text !== record.title &&
          !text.startsWith("A free resource from JesusOnline Ministries") &&
          !text.startsWith("Companion to The Adventure of Living with Jesus") &&
          !text.startsWith("After The Adventure of Living with Jesus") &&
          !text.startsWith("Begin in the JO FOLLOW")
        );
      })
      .map((block) => {
        const text = block.text.trim();
        const isShortNumberedHeading = /^\d+\.\s+\S/.test(text) && text.length < 80;
        return {
          type:
            block.kind === "paragraph" && (text === "Overview" || isShortNumberedHeading)
              ? "heading"
              : block.kind === "paragraph" && text.endsWith("?")
                ? "question"
                : block.kind,
          text: block.text,
          src: block.src,
          links: block.links,
        };
      });
    const excerpt =
      blocks.find((block) => block.type === "paragraph")?.text ??
      "A Go Deeper companion from Follow Jesus Online.";
    return {
      slug: metadata.slug,
      title: record.title,
      group: "deeper",
      order: metadata.order,
      excerpt,
      blocks,
      continuation: metadata.continuation,
    };
  });

const prayerRecords: Article[] = prayerMetadata.map(metadata => {
  const source = generatedContent.find(record =>
    record.category === "Prayer" && record.route === `/${metadata.slug}`);
  if (!source) throw new Error(`Missing prayer article: ${metadata.title}`);
  const blocks: ArticleBlock[] = source.blocks
    .filter((block, index) => !(index === 0 && block.text === source.title))
    .map(block => ({ type: block.kind, text: block.text, src: block.src, links: block.links }));
  return {
    slug: metadata.slug,
    title: source.title,
    group: "prayer",
    order: metadata.order,
    excerpt: blocks.find(block => block.type === "paragraph")?.text ?? "",
    blocks,
  };
});

export const ARTICLE_LIBRARY = [
  ...(library.articles as Article[]).filter((article) => !article.retired).map((article) => {
    const updated = updatedBySlug.get(article.slug);
    const relatedLink = linkedFromFaq.get(article.slug);
    const sourceBlocks = updated && isApprovedFaq(article)
      ? revisedFaqBlocks(updated, article.blocks)
      : updated ? updated.blocks
        .filter((block, index) =>
          !(index === 0 && block.kind === "heading" && block.text === updated.title))
        .map((block) => ({
          type: article.group === "adventure" && /^_+$/.test(block.text.trim())
            ? "answer-line" as const
            : article.group === "adventure" &&
            block.kind === "paragraph" &&
            /^(?:Q:|Your thoughts:)/i.test(block.text)
            ? "question" as const
            : block.kind,
          text: block.text,
          src: block.src,
          links: block.links,
        }))
      : article.blocks;
    const guidePdfNavigationIndex = article.group === "adventure"
      ? sourceBlocks.findIndex((block) =>
          block.text === "Keep walking. If you want more on what you just read, pause here first." ||
          block.text === "Keep walking. If you want more on the inner life this booklet has opened, pause here first.")
      : -1;
    const blocks = guidePdfNavigationIndex >= 0
      ? sourceBlocks.slice(0, guidePdfNavigationIndex)
      : sourceBlocks;
    return {
      ...article,
      ...(updated
        ? {
            title: updated.title,
            excerpt: blocks.find((block) => block.type === "paragraph")?.text ?? article.excerpt,
            blocks,
          }
        : {}),
      ...(relatedLink &&
        shouldAppendFaqRelatedLink(article.slug, relatedLink.href) &&
        !blocks.some((block) =>
          ("href" in block && block.href === relatedLink.href) ||
          block.links?.some((link) => link.href === relatedLink.href),
        )
        ? {
            blocks: [...blocks, { type: "link" as const, ...relatedLink }],
          }
        : {}),
      order: article.group === "deeper" ? article.order + importedDeeperArticles.length : article.order,
      relatedSlug: adventureCompanions[article.slug] ?? article.relatedSlug,
    };
  }),
  ...importedDeeperRecords,
  ...linkedArticles,
  ...prayerRecords,
].map(applyGuideMainFormatRevisions).map(applyGuideDeeperFormatRevisions);

export function getArticleBySlug(slug: string) {
  return ARTICLE_LIBRARY.find((article) => article.slug === slug);
}

export function getGuideArticleForDeeper(slug: string) {
  const currentGuide = ARTICLE_LIBRARY.find(
    (article) => article.group === "adventure" && article.relatedSlug === slug,
  );
  if (currentGuide) return currentGuide;

  const originalGuide = (library.articles as Article[]).find(
    (article) => article.group === "adventure" && article.relatedSlug === slug,
  );
  return originalGuide ? getArticleBySlug(originalGuide.slug) : undefined;
}

export function getArticlePath(slug: string) {
  const prayer = prayerMetadata.find(article => article.slug === slug);
  if (prayer) return prayer.href;
  if (slug.startsWith("adv-")) return `/adv/${slug.slice("adv-".length)}`;
  if (slug.startsWith("deeper-")) return `/deeper/${slug.slice("deeper-".length)}`;
  return `/${slug}`;
}

export function getArticleSlugFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && segments[0] === "prayer") return "prayer-starter-guide";
  if (segments.length === 2 && (segments[0] === "adv" || segments[0] === "deeper" || segments[0] === "prayer")) {
    return `${segments[0]}-${segments[1]}`;
  }
  return segments.length === 1 ? segments[0] : undefined;
}

export function getArticlesInGroup(group: ArticleGroup) {
  return ARTICLE_LIBRARY
    .filter((article) => article.group === group)
    .sort((a, b) => a.order - b.order);
}