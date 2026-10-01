import type { Article } from "./article-library";

const formatTargetsBySlug: Record<string, { bold: string[] }> = {
  "deeper-embracing-your-new-identity-in-christ": {
    bold: [
      "You are a child of God.",
      "You are a saint with a new nature.",
      "You are a member of the body of Christ.",
      "You are a citizen of God’s kingdom.",
    ],
  },
  "deeper-faith-knowing-god-who-is-trustworthy": {
    bold: ["God is true", "God is able", "God is faithful"],
  },
  "deeper-the-lords-prayer-guide": {
    bold: [
      "Focus on your relationship with God, your Heavenly Father.",
      "Focus on worshiping God, your Almighty Creator.",
      "Focus on rededicating yourself to God, your Sovereign Ruler.",
      "Focus on asking for direction from God, the Gracious Revealer.",
      "Focus on asking for what you need from God, your Faithful Sustainer.",
      "Focus on asking for forgiveness from God, your Righteous Judge.",
      "Focus on asking for protection from God, your Merciful Deliverer.",
      "Focus on the needs of others.",
    ],
  },
};

const belongAndBecomePrinciples = [
  "– Pray first and always.",
  "– Look for Christ in a life.",
  "– Start small.",
  "– Be in God’s Word as much as you can safely.",
  "– Be careful with strangers, especially online.",
];

function matchesTarget(text: string, target: string) {
  const normalizedText = text.trim();
  if (normalizedText === target) return "exact";
  if (normalizedText.startsWith(target)) return "prefix";
  if (normalizedText.includes(target)) return "contained";
  return undefined;
}

function findBoldTarget(
  article: Article,
  target: string,
): { index: number; isStandalone: boolean } {
  const matches = article.blocks
    .map((block, index) => ({ block, index, match: matchesTarget(block.text, target) }))
    .filter((result) => result.match);
  const exactMatches = matches.filter((result) => result.match === "exact");
  const preferredMatches = exactMatches.length
    ? exactMatches
    : matches.filter((result) => result.match === "prefix");
  const candidates = preferredMatches.length ? preferredMatches : matches;

  if (candidates.length !== 1) {
    const problem = candidates.length ? `found ${candidates.length} matches` : "not found";
    throw new Error(`Go Deeper formatting target ${JSON.stringify(target)} ${problem} in ${article.slug}.`);
  }

  return {
    index: candidates[0].index,
    isStandalone: candidates[0].match === "exact",
  };
}

function revisedBelongAndBecomeBlocks(article: Article) {
  const sectionIndex = article.blocks.findIndex(
    (block) => block.type === "heading" && block.text === "If Gathering Is Costly or Hidden",
  );
  if (sectionIndex < 0) {
    throw new Error(`Go Deeper formatting section "If Gathering Is Costly or Hidden" not found in ${article.slug}.`);
  }

  let sectionEnd = article.blocks.findIndex(
    (block, index) => index > sectionIndex && block.type === "heading",
  );
  if (sectionEnd < 0) sectionEnd = article.blocks.length;

  const principleIndexes = belongAndBecomePrinciples.map((target) => {
    const matches = article.blocks
      .map((block, index) => ({ block, index }))
      .filter(({ block, index }) =>
        index > sectionIndex &&
        index < sectionEnd &&
        block.text.startsWith(target),
      );
    if (matches.length !== 1) {
      const problem = matches.length ? `found ${matches.length} matches` : "not found";
      throw new Error(
        `Go Deeper formatting principle ${JSON.stringify(target)} ${problem} under "If Gathering Is Costly or Hidden" in ${article.slug}.`,
      );
    }
    return matches[0].index;
  });

  const principleSet = new Set(principleIndexes);
  article.blocks.forEach((block, index) => {
    if (index > sectionIndex && index < sectionEnd && block.text.startsWith("– ")) {
      principleSet.add(index);
    }
  });
  return article.blocks.map((block, index) =>
    principleSet.has(index)
      ? { ...block, type: "list" as const, text: block.text.replace(/^– /, "") }
      : block,
  );
}

export function applyGuideDeeperFormatRevisions(article: Article): Article {
  const targets = formatTargetsBySlug[article.slug];
  const isBelongAndBecome = article.slug === "deeper-belong-and-become";
  if (!targets && !isBelongAndBecome) return article;

  const boldTargets = new Map<number, { standalone: boolean; phrases: string[] }>();
  for (const target of targets?.bold ?? []) {
    const { index, isStandalone } = findBoldTarget(article, target);
    const existing = boldTargets.get(index) ?? { standalone: false, phrases: [] };
    if (isStandalone) existing.standalone = true;
    else existing.phrases.push(target);
    boldTargets.set(index, existing);
  }

  const baseBlocks = isBelongAndBecome
    ? revisedBelongAndBecomeBlocks(article)
    : article.blocks;
  const blocks = baseBlocks.map((block, index) => {
    const formatting = boldTargets.get(index);
    if (!formatting) return block;
    return {
      ...block,
      ...(formatting.standalone ? { bold: true } : {}),
      ...(formatting.phrases.length
        ? {
            boldPhrases: [
              ...new Set([
                ...((block as typeof block & { boldPhrases?: string[] }).boldPhrases ?? []),
                ...formatting.phrases,
              ]),
            ],
          }
        : {}),
    };
  });

  return { ...article, blocks };
}