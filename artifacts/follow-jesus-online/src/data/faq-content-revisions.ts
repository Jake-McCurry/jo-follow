type FaqSourceLink = {
  label: string;
  href: string;
};

type FaqSourceBlock = {
  kind: "heading" | "paragraph" | "question" | "list" | "image";
  text: string;
  src?: string;
  links?: FaqSourceLink[];
};

const newDeeplyFaqBlocks: FaqSourceBlock[] = [
  { kind: "heading", text: "I Want to Know Jesus More Deeply" },
  {
    kind: "paragraph",
    text: "Four primary vehicles will help you grow closer and deeper in your relationship with Jesus.",
  },
  { kind: "list", text: "The Bible" },
  { kind: "list", text: "Prayer" },
  { kind: "list", text: "Worship" },
  { kind: "list", text: "Fellowship" },
  { kind: "heading", text: "The Bible" },
  {
    kind: "paragraph",
    text: "As God’s written Word, the Bible is one of the primary ways to know Jesus and understand who He is. It is also the essential source of spiritual nourishment. It is the standard by which you can discern your spiritual experiences, helping you recognize the true manifest presence of Jesus. Learn more about the Bible >>>",
    links: [{ label: "Learn more about the Bible >>>", href: "/adv/gods-word" }],
  },
  { kind: "heading", text: "Prayer" },
  {
    kind: "paragraph",
    text: "Another way you can get to know Jesus is through prayer. Prayer is a conversation with God. But it is more than a communication platform. It is a powerful way to get to know Jesus more intimately. Learn more about prayer >>>",
    links: [{ label: "Learn more about prayer >>>", href: "/adv/prayer" }],
  },
  { kind: "heading", text: "Worship" },
  {
    kind: "paragraph",
    text: "“But You are holy, Enthroned in the praises of Israel.” (Psalm 22:3)",
  },
  {
    kind: "paragraph",
    text: "We are more likely to experience God’s presence when we worship and praise Him.",
  },
  { kind: "heading", text: "Fellowship" },
  {
    kind: "paragraph",
    text: "A Christian fellowship is a community of believers on God’s mission. Through your active involvement in a fellowship, you will get to know Jesus in ways you simply cannot by yourself. Learn more about God’s family >>>",
    links: [{ label: "Learn more about God’s family >>>", href: "/adv/belonging-to-gods-family" }],
  },
  { kind: "heading", text: "7 Habits for Intimacy with God" },
  {
    kind: "paragraph",
    text: "Using the above four vehicles, you can cultivate seven habits to build a closer relationship with Jesus. He says:",
  },
  {
    kind: "paragraph",
    text: "“For whoever has will be given more, and will have an abundance. But whoever does not have, even what he has will be taken from him.” (Matthew 13:12)",
  },
  {
    kind: "paragraph",
    text: "This is true of the seven habits for intimacy with God. Learn the habits >>>",
  },
  { kind: "heading", text: "Your Questions?" },
  {
    kind: "paragraph",
    text: "Have a question about following Jesus? Write it in the box below. I’d love to explore it together and help you find an answer. —Pastor Jon",
  },
  {
    kind: "paragraph",
    text: "Send a message",
    links: [{ label: "Send a message", href: "/message" }],
  },
  {
    kind: "paragraph",
    text: "Learn more about the Bible >>>",
    links: [{ label: "Learn more about the Bible >>>", href: "/adv/gods-word" }],
  },
  {
    kind: "paragraph",
    text: "Learn more about prayer >>>",
    links: [{ label: "Learn more about prayer >>>", href: "/adv/prayer" }],
  },
  {
    kind: "paragraph",
    text: "Learn more about God’s family >>>",
    links: [{ label: "Learn more about God’s family >>>", href: "/adv/belonging-to-gods-family" }],
  },
];

const removedFaqLinkPatterns: Record<string, RegExp[]> = {
  "more-received-how-do-i-know-this-is-real": [
    /^Learn more about\s*[“"]?How to Experience God[’']s Forgiveness[”"]?\s*$/i,
  ],
  "more-received-how-should-i-handle-my-current-relationships": [
    /^Learn more about God[’']s Love\s*$/i,
  ],
  "more-received-other-questions": [
    /^Learn more about overcoming old habits and sins:\s*[“"]?Struggling with Destructive Behavior\??[”"]?\s*$/i,
    /^Learn more about\s*[“"]?Fleeing Temptation[”"]?\.?\s*$/i,
    /^Learn\s*[“"]?Spiritual Breathing[”"]? to maintain your fellowship with God\.?\s*$/i,
  ],
  "more-returning-how-should-i-handle-the-relationships-and-patterns-i-left-behind": [
    /^Learn more about how to\s*[“"]?Experience God[’']s Love[”"]?\s*$/i,
  ],
};

function isRemovedFaqLinkText(route: string, text: string) {
  const cleanedText = text.replace(/\s*>{3}\s*$/, "").trim();
  return removedFaqLinkPatterns[route]?.some((pattern) => pattern.test(cleanedText)) ?? false;
}

function moveFirstParagraphUnderQuestion(
  blocks: FaqSourceBlock[],
  question: RegExp,
): FaqSourceBlock[] {
  const questionIndex = blocks.findIndex(
    (block, index) => index > 0 && block.kind === "heading" && question.test(block.text),
  );
  if (questionIndex < 0) return blocks;

  const firstIntroIndex = blocks.findIndex(
    (block, index) => index > 0 && index < questionIndex && block.kind === "paragraph",
  );
  if (firstIntroIndex < 0) return blocks;

  const revised = [...blocks];
  const [intro] = revised.splice(firstIntroIndex, 1);
  const revisedQuestionIndex = revised.findIndex(
    (block, index) => index > 0 && block.kind === "heading" && question.test(block.text),
  );
  revised.splice(revisedQuestionIndex + 1, 0, intro);
  return revised;
}

function splitProdigalPassage(block: FaqSourceBlock): FaqSourceBlock[] {
  const citation = block.text.match(/\s*(\(Luke 15:11-24\))\s*$/)?.[1];
  if (!citation) {
    throw new Error("The returning FAQ prodigal-son passage is missing its Luke 15:11-24 citation.");
  }

  const passage = block.text.slice(0, block.text.length - citation.length).trim();
  const paragraphs = passage
    .split(/(?=\b15:(?:17|20|22)\s+)/)
    .map((text) => text.replace(/\b15:\d+\s*/g, "").trim())
    .filter(Boolean);
  if (paragraphs.length !== 4 || paragraphs[1][0] !== "B" || paragraphs[2][0] !== "S" || paragraphs[3][0] !== "B") {
    throw new Error("The returning FAQ prodigal-son passage no longer has its expected verse breaks.");
  }

  return paragraphs.map((text) => ({ kind: "paragraph", text }));
}

function reviseReturningEvidencePrompts(blocks: FaqSourceBlock[]): FaqSourceBlock[] {
  let currentEvidenceLabel = "Examine the evidence for Jesus’ true identity";
  let currentEvidenceHref = "https://app.jesusonline.com/series/73";
  return blocks.map((block) => {
    if (block.kind === "heading" && /Can I trust the Bible again/i.test(block.text)) {
      currentEvidenceLabel = "Examine the evidence for the reliability of the Bible";
      currentEvidenceHref = "https://app.jesusonline.com/series/72";
      return block;
    }
    if (block.kind === "heading" && /How do I know Christianity is actually true/i.test(block.text)) {
      currentEvidenceLabel = "Examine the evidence for Jesus’ true identity";
      currentEvidenceHref = "https://app.jesusonline.com/series/73";
      return block;
    }
    const hasEvidencePrompt = /Examine the evidence for yourself/i.test(block.text);
    return {
      ...block,
      text: block.text.replace(/Examine the evidence for yourself/gi, currentEvidenceLabel),
      ...(hasEvidencePrompt
        ? {
            links: block.links?.map((link) =>
              /Examine the evidence for yourself/i.test(link.label)
                ? { ...link, label: currentEvidenceLabel, href: currentEvidenceHref }
                : link,
            ),
          }
        : {}),
    };
  });
}

function addCitizenPromptAfterRomansVerse(blocks: FaqSourceBlock[]): FaqSourceBlock[] {
  const verseIndex = blocks.findIndex(
    (block) => block.kind === "paragraph" && /\bRomans 10:9\b/.test(block.text),
  );
  if (verseIndex < 0) {
    throw new Error("The new-believer FAQ no longer contains its Romans 10:9 answer.");
  }
  return [
    ...blocks.slice(0, verseIndex + 1),
    {
      kind: "paragraph",
      text: "Learn more about becoming a “Citizen of Heaven” >>>",
    },
    ...blocks.slice(verseIndex + 1),
  ];
}

export function isRemovedFaqContent(route: string, text: string) {
  return isRemovedFaqLinkText(route, text);
}

export function applyFaqContentRevisions(
  route: string,
  sourceBlocks: FaqSourceBlock[],
): FaqSourceBlock[] {
  if (route === "more-returning-i-want-to-know-jesus-more-deeply") {
    return newDeeplyFaqBlocks;
  }

  const hasAssurancePrompt = route === "more-received-how-do-i-know-this-is-real" &&
    sourceBlocks.some((block) =>
      /Learn more about\s*[“"]?Assurance of Your Salvation/i.test(block.text),
    );
  let blocks = sourceBlocks
    .filter((block) => !isRemovedFaqLinkText(route, block.text))
    .map((block) => {
      let text = block.text;
      if (route === "more-received-how-do-i-know-this-is-real") {
        text = text.replace(
          /Learn more about\s*[“"]?Assurance of Your Salvation[”"]?\s*(?:>{3})?/i,
          "Learn more about becoming a “Citizen of Heaven” >>>",
        );
        const links = block.links?.map((link) =>
          /Learn more about\s*[“"]?Assurance of Your Salvation/i.test(link.label)
            ? {
                ...link,
                label: "Learn more about becoming a “Citizen of Heaven”",
                href: "/adv/citizen-of-heaven",
              }
            : link,
        );
        return { ...block, text, ...(links ? { links } : {}) };
      }
      if (route === "more-returning-i-feel-ashamed-or-distant") {
        text = text.replace(/(?<!\u00a0) \(Romans 8:38-39\)/g, "\u00a0(Romans 8:38-39)");
      }
      return { ...block, text };
    });

  if (route === "more-received-what-do-i-do-now") {
    const congratulationsIndex = blocks.findIndex(
      (block) => block.kind === "paragraph" && block.text.trim() === "Congratulations!",
    );
    const firstSentenceIndex = congratulationsIndex < 0
      ? -1
      : blocks.findIndex(
          (block, index) => index > congratulationsIndex && block.kind === "paragraph",
        );
    if (congratulationsIndex >= 0 && firstSentenceIndex >= 0) {
      const revised = [...blocks];
      revised[firstSentenceIndex] = {
        ...revised[firstSentenceIndex],
        text: `Congratulations! ${revised[firstSentenceIndex].text}`,
      };
      revised.splice(congratulationsIndex, 1);
      blocks = revised;
    }
  }

  if (route === "more-received-how-do-i-know-this-is-real") {
    blocks = moveFirstParagraphUnderQuestion(
      blocks,
      /Has God really forgiven me for my sin/i,
    );
    if (!hasAssurancePrompt) {
      blocks = addCitizenPromptAfterRomansVerse(blocks);
    }
  }

  if (route === "more-returning-other-questions") {
    blocks = moveFirstParagraphUnderQuestion(
      blocks,
      /Does God still want me after I walked away/i,
    );
    blocks = reviseReturningEvidencePrompts(blocks);
  }

  if (route === "more-returning-i-feel-ashamed-or-distant") {
    const revised: FaqSourceBlock[] = [];
    let passageFound = false;
    for (const block of blocks) {
      revised.push(block);
      if (block.kind === "heading" && /Have you read the story Jesus told/i.test(block.text)) {
        revised.push({ kind: "paragraph", text: "(Luke 15:11-24)" });
      } else if (!passageFound && block.kind === "paragraph" && /\b15:11\s+Then Jesus said/.test(block.text)) {
        revised.pop();
        revised.push(...splitProdigalPassage(block));
        passageFound = true;
      }
    }
    if (!passageFound) {
      throw new Error("The returning FAQ no longer contains the Luke 15:11-24 prodigal-son passage.");
    }
    blocks = revised;
  }

  if (route === "more-returning-i-have-questions-about-getting-connected-again") {
    blocks = blocks.map((block) =>
      block.text.includes("Prodigal Son in Luke 15") &&
      !block.links?.some((link) => link.label === "Prodigal Son in Luke 15")
        ? {
            ...block,
            links: [
              ...(block.links ?? []),
              { label: "Prodigal Son in Luke 15", href: "/bible/luke/15#verse-11" },
            ],
          }
        : block,
    );
  }

  return blocks;
}

const retiredFaqReadingRedirects: Record<string, string> = {
  "deeper-assurance-of-your-salvation": "/adv/citizen-of-heaven",
  "deeper-faith-knowing-who-you-can-trust": "/adv/walking-by-faith",
  "deeper-spiritual-breathing": "/adv/the-holy-spirit",
  "deeper-how-to-experience-god": "/adv/citizen-of-heaven",
  "more-the-holy-spirit": "/adv/the-holy-spirit",
  "more-the-bible": "/adv/gods-word",
  "more-struggling-with-destructive-behavior": "/adv/your-new-identity-christ",
  "more-fleeing-temptation": "/adv/the-holy-spirit",
};

export function redirectRetiredFaqReading(href: string) {
  const pathname = href.split(/[?#]/, 1)[0];
  const slug = pathname
    .replace(/^\/deeper\//, "deeper-")
    .replace(/^\//, "");
  return retiredFaqReadingRedirects[slug] ?? href;
}

export function shouldAppendFaqRelatedLink(route: string, href: string) {
  return !(
    route === "more-received-how-should-i-handle-my-current-relationships" &&
    href === "/more-gods-love"
  );
}