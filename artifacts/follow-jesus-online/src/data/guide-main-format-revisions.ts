import type { Article, ArticleBlock } from "./article-library";

type GuideMainFormatBlock = ArticleBlock & {
  bold?: boolean;
  boldPhrases?: string[];
  presentation?: "story";
};

const DAILY_POWER_TABLE = [
  "Daily issue",
  "My power",
  "God’s power",
  "Relationships",
  "☐",
  "☐",
  "Health / fears",
  "☐",
  "☐",
  "Trials / temptations",
  "☐",
  "☐",
  "Emotions",
  "☐",
  "☐",
  "School / work",
  "☐",
  "☐",
  "Goals / dreams",
  "☐",
  "☐",
];

const EXAMINING_TRUST_TABLE = [
  "Area",
  "Helping",
  "Hurting",
  "Friends",
  "☐",
  "☐",
  "Recreations",
  "☐",
  "☐",
  "Habits",
  "☐",
  "☐",
  "Time in God’s Word",
  "☐",
  "☐",
  "Thoughts",
  "☐",
  "☐",
];

const DAILY_POWER_ALT =
  "Daily Power worksheet with My power and God’s power columns for relationships, health or fears, trials or temptations, emotions, school or work, and goals or dreams.";

const EXAMINING_TRUST_ALT =
  "Examining Your Trust worksheet with Helping and Hurting columns for friends, recreations, habits, time in God’s Word, and thoughts.";

function addBoldPhrase(block: GuideMainFormatBlock, phrase: string): GuideMainFormatBlock {
  const boldPhrases = block.boldPhrases ?? [];
  return boldPhrases.includes(phrase)
    ? block
    : { ...block, boldPhrases: [...boldPhrases, phrase] };
}

function emphasizeText(block: GuideMainFormatBlock, target: string): GuideMainFormatBlock {
  const text = block.text.trim();
  const normalizedText = text.toLocaleLowerCase();
  const normalizedTarget = target.toLocaleLowerCase();

  if (normalizedText === normalizedTarget) return { ...block, bold: true };

  const match = new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").exec(block.text);
  return match ? addBoldPhrase(block, match[0]) : block;
}

function emphasizePrayerTitles(block: GuideMainFormatBlock): GuideMainFormatBlock {
  const title = /^\s*(A prayer)(?=$|\s*[:—–-]|\r?\n)/i.exec(block.text);
  if (!title) return block;

  if (block.text.trim().toLocaleLowerCase() === "a prayer") {
    return { ...block, bold: true };
  }

  return addBoldPhrase(block, title[1]);
}

function requireTable(
  blocks: GuideMainFormatBlock[],
  slug: string,
  expectedHeading: string,
  expectedContents: string[],
  endMarker: string,
  imageName: string,
  imageAlt: string,
): GuideMainFormatBlock[] {
  const headingIndex = blocks.findIndex((block) => block.text.trim() === expectedHeading);
  const tableStart = blocks.findIndex((block, index) =>
    index > headingIndex && block.type === "paragraph" && block.text.trim() === expectedContents[0],
  );
  const tableEnd = tableStart < 0
    ? -1
    : blocks.findIndex((block, index) => index > tableStart && block.text.startsWith(endMarker));

  if (
    headingIndex < 0 ||
    tableStart < 0 ||
    tableEnd < 0 ||
    tableEnd - tableStart !== expectedContents.length
  ) {
    throw new Error(`Missing or changed ${expectedHeading} table in ${slug}`);
  }

  const actualContents = blocks.slice(tableStart, tableEnd).map((block) => block.text.trim());
  if (actualContents.some((text, index) => text !== expectedContents[index])) {
    throw new Error(`Unexpected flattened ${expectedHeading} table contents in ${slug}`);
  }

  return [
    ...blocks.slice(0, tableStart),
    { type: "image", text: imageAlt, src: imageName },
    ...blocks.slice(tableEnd),
  ];
}

function reviseDailyPowerTable(blocks: GuideMainFormatBlock[], slug: string) {
  return requireTable(
    blocks,
    slug,
    "Your Daily Power",
    DAILY_POWER_TABLE,
    "When you get up in the morning",
    "guide-daily-power.png",
    DAILY_POWER_ALT,
  );
}

function reviseExaminingTrustTable(blocks: GuideMainFormatBlock[], slug: string) {
  return requireTable(
    blocks,
    slug,
    "Examining Your Trust",
    EXAMINING_TRUST_TABLE,
    "Do not conform to the pattern of this world",
    "guide-examining-trust.png",
    EXAMINING_TRUST_ALT,
  );
}

function reviseStory(blocks: GuideMainFormatBlock[], slug: string) {
  const storyTitleIndex = blocks.findIndex((block) => /^Joni[’']s Story$/i.test(block.text.trim()));
  if (storyTitleIndex < 0 || blocks[storyTitleIndex + 1]?.type !== "paragraph") {
    throw new Error(`Missing Joni’s Story body in ${slug}`);
  }

  const revised = [...blocks];
  revised[storyTitleIndex + 1] = {
    ...revised[storyTitleIndex + 1],
    presentation: "story",
  };
  return revised;
}

function revisePrayerLabels(block: GuideMainFormatBlock) {
  const text = block.text.replace(
    /^(Thanksgiving and adoration|Bringing requests)\./,
    "$1:",
  );
  const labels = [
    "Beginning the day:",
    "Claiming His promises:",
    "Restoring fellowship:",
    "Thanksgiving and adoration:",
    "Bringing requests:",
  ];
  const label = labels.find((candidate) => text.startsWith(candidate));
  if (!label) return block;

  const revised = text === block.text ? block : { ...block, text };
  return addBoldPhrase(revised, label);
}

function reviseActsCitation(block: GuideMainFormatBlock): GuideMainFormatBlock {
  const text = block.text.replace(
    /Acts\s*2:42[–-]47,\s*(?:Acts\s*)?4:32[–-]35\s+and\s+(?:Acts\s*)?11:27(?:(?:[–-])30|:30)/i,
    "Acts 2:42-47, Acts 4:32-35 and Acts 11:27-30",
  );
  return text === block.text ? block : { ...block, text };
}

export function applyGuideMainFormatRevisions(article: Article): Article {
  if (article.group !== "adventure") return article;

  let blocks: GuideMainFormatBlock[] = article.blocks.map((block) => {
    let revised = block as GuideMainFormatBlock;

    const bullet = revised.type === "paragraph" && /^\s*•\s*/.test(revised.text);
    if (bullet) {
      revised = {
        ...revised,
        type: "list",
        text: revised.text.replace(/^\s*•\s*/, ""),
      };
    }

    revised = emphasizePrayerTitles(revised);

    if (article.slug === "adv-begin-the-adventure") {
      revised = emphasizeText(revised, "How to find a Bible verse");
    } else if (article.slug === "adv-citizen-of-heaven") {
      revised = emphasizeText(revised, "Growth Is God’s Plan for You");
    } else if (article.slug === "adv-prayer") {
      revised = revisePrayerLabels(revised);
    } else if (article.slug === "adv-belonging-to-gods-family") {
      revised = reviseActsCitation(revised);
    }

    return revised;
  });

  if (article.slug === "adv-the-holy-spirit") {
    blocks = reviseDailyPowerTable(blocks, article.slug);
  } else if (article.slug === "adv-walking-by-faith") {
    blocks = reviseStory(blocks, article.slug);
    blocks = reviseExaminingTrustTable(blocks, article.slug);
  }

  return { ...article, blocks };
}