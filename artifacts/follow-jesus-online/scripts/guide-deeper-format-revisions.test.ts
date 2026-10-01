import assert from "node:assert/strict";
import test from "node:test";
import type { Article } from "../src/data/article-library.ts";
import { applyGuideDeeperFormatRevisions } from "../src/data/guide-deeper-format-revisions.ts";

type FormatBlock = Article["blocks"][number] & {
  bold?: boolean;
  boldPhrases?: string[];
};

function makeArticle(slug: string, blocks: Article["blocks"]): Article {
  return {
    slug,
    title: "Test article",
    group: "deeper",
    order: 0,
    excerpt: "Test excerpt",
    blocks,
  };
}

function formatBlock(block: Article["blocks"][number]): FormatBlock {
  return block as FormatBlock;
}

test("bolds the four identity statements without changing article text or links", () => {
  const linkedStatement = {
    type: "paragraph" as const,
    text: "You are a child of God.",
    links: [{ label: "Read more", href: "/more" }],
  };
  const source = makeArticle("deeper-embracing-your-new-identity-in-christ", [
    linkedStatement,
    { type: "paragraph", text: "You are a saint with a new nature." },
    { type: "paragraph", text: "You are a member of the body of Christ." },
    { type: "paragraph", text: "You are a citizen of God’s kingdom." },
  ]);
  const original = structuredClone(source);

  const revised = applyGuideDeeperFormatRevisions(source);

  assert.deepEqual(source, original);
  assert.notEqual(revised, source);
  assert.deepEqual(revised.blocks.map((block) => formatBlock(block).bold), [true, true, true, true]);
  assert.deepEqual(revised.blocks.map(({ text }) => text), source.blocks.map(({ text }) => text));
  assert.deepEqual(revised.blocks[0].links, linkedStatement.links);
});

test("bolds the three statements of God’s trustworthiness and supports inline prefixes", () => {
  const source = makeArticle("deeper-faith-knowing-god-who-is-trustworthy", [
    { type: "paragraph", text: "God is true. Everything He says is true." },
    { type: "paragraph", text: "God is able" },
    { type: "paragraph", text: "God is faithful" },
  ]);

  const revised = applyGuideDeeperFormatRevisions(source);

  assert.deepEqual(
    revised.blocks.map((block) => ({
      bold: formatBlock(block).bold,
      boldPhrases: formatBlock(block).boldPhrases,
    })),
    [
      { bold: undefined, boldPhrases: ["God is true"] },
      { bold: true, boldPhrases: undefined },
      { bold: true, boldPhrases: undefined },
    ],
  );
  assert.equal(revised.blocks[0].text, source.blocks[0].text);
});

test("bolds all eight Lord’s Prayer focus instructions", () => {
  const focusInstructions = [
    "Focus on your relationship with God, your Heavenly Father.",
    "Focus on worshiping God, your Almighty Creator.",
    "Focus on rededicating yourself to God, your Sovereign Ruler.",
    "Focus on asking for direction from God, the Gracious Revealer.",
    "Focus on asking for what you need from God, your Faithful Sustainer.",
    "Focus on asking for forgiveness from God, your Righteous Judge.",
    "Focus on asking for protection from God, your Merciful Deliverer.",
    "Focus on the needs of others.",
  ];
  const source = makeArticle("deeper-the-lords-prayer-guide", [
    { type: "heading", text: "Overview" },
    ...focusInstructions.map((text, index) => ({
      type: "paragraph" as const,
      text: index === 0 ? `Opening instruction: ${text} Let this shape your prayer.` : text,
    })),
  ]);
  const originalTexts = source.blocks.map((block) => block.text);

  const revised = applyGuideDeeperFormatRevisions(source);

  assert.equal(
    revised.blocks.filter((block) => formatBlock(block).bold).length,
    7,
  );
  assert.deepEqual(formatBlock(revised.blocks[1]).boldPhrases, [focusInstructions[0]]);
  assert.ok(revised.blocks.slice(2).every((block) => formatBlock(block).bold));
  assert.deepEqual(revised.blocks.map((block) => block.text), originalTexts);
  assert.notEqual(source.blocks, revised.blocks);
});

test("turns all six dash-start principles into list items and removes their prefixes", () => {
  const principles = [
    "Pray first and always. The Head of the church knows His people in your city and can lead you to them.",
    "Look for Christ in a life. Does this person love Jesus, honor Scripture, and walk in the Spirit both in words and deeds?",
    "Start small. A faithful friend who will read the Bible and pray with you is true fellowship.",
    "Be in God’s Word as much as you can safely. Even when fellowship is not available, God’s Word will sustain you.",
    "Be careful with strangers, especially online. Not everyone who uses Christian words is a brother or sister.",
    "Do not despise online fellowship, and do not let it replace in-person fellowship if God opens a door. A trusted online church or discipleship community can strengthen you while you wait. It cannot do all that a shared life can do.",
  ];
  const source = makeArticle("deeper-belong-and-become", [
    { type: "heading", text: "If Gathering Is Costly or Hidden" },
    { type: "paragraph", text: "Where open fellowship is limited, hold to these principles:" },
    ...principles.map((text, index) => ({
      type: index === 1 ? "question" as const : "paragraph" as const,
      text: `– ${text}`,
    })),
    { type: "heading", text: "Belong to Become" },
    { type: "paragraph", text: "– Keep this unrelated dash-start copy unchanged." },
  ]);
  const original = structuredClone(source);

  const revised = applyGuideDeeperFormatRevisions(source);
  const revisedPrinciples = revised.blocks.slice(2, 8);

  assert.deepEqual(source, original);
  assert.deepEqual(revisedPrinciples.map(({ type, text }) => ({ type, text })), principles.map((text) => ({
    type: "list",
    text,
  })));
  assert.deepEqual(revised.blocks[8], source.blocks[8]);
});

test("reports missing required formatting targets instead of silently skipping them", () => {
  const source = makeArticle("deeper-embracing-your-new-identity-in-christ", [
    { type: "paragraph", text: "You are a child of God." },
  ]);

  assert.throws(
    () => applyGuideDeeperFormatRevisions(source),
    /You are a saint with a new nature.*not found.*deeper-embracing-your-new-identity-in-christ/,
  );
});

test("leaves unrelated articles unchanged", () => {
  const source = makeArticle("unrelated-article", [
    { type: "paragraph", text: "Keep this paragraph." },
  ]);

  assert.equal(applyGuideDeeperFormatRevisions(source), source);
});