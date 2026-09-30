import assert from "node:assert/strict";
import test from "node:test";
import type { Article, ArticleBlock } from "../src/data/article-library";
import { applyGuideMainFormatRevisions } from "../src/data/guide-main-format-revisions";

type FormattedBlock = ArticleBlock & {
  bold?: boolean;
  boldPhrases?: string[];
  presentation?: "story";
};

function makeArticle(slug: string, blocks: ArticleBlock[], group: Article["group"] = "adventure"): Article {
  return { slug, title: slug, group, order: 0, excerpt: "", blocks };
}

function paragraph(text: string, type: ArticleBlock["type"] = "paragraph"): ArticleBlock {
  return { type, text };
}

function heading(text: string): ArticleBlock {
  return { type: "heading", text };
}

function formattedBlocks(article: Article): FormattedBlock[] {
  return article.blocks as FormattedBlock[];
}

const dailyPowerRows = [
  "Daily issue", "My power", "God’s power",
  "Relationships", "☐", "☐",
  "Health / fears", "☐", "☐",
  "Trials / temptations", "☐", "☐",
  "Emotions", "☐", "☐",
  "School / work", "☐", "☐",
  "Goals / dreams", "☐", "☐",
];

const examiningTrustRows = [
  "Area", "Helping", "Hurting",
  "Friends", "☐", "☐",
  "Recreations", "☐", "☐",
  "Habits", "☐", "☐",
  "Time in God’s Word", "☐", "☐",
  "Thoughts", "☐", "☐",
];

test("formats chapter-one bullets and titles immutably without bolding narrative mentions of prayer", () => {
  const original = makeArticle("adv-begin-the-adventure", [
    heading("What You Will Discover"),
    paragraph("• Citizen of Heaven — belonging"),
    paragraph(" • Your New Identity — life in Christ"),
    paragraph("How to find a Bible verse"),
    paragraph("A prayer can help you talk with God."),
    heading("A prayer"),
    paragraph("A Prayer: words offered in faith."),
  ]);
  const before = structuredClone(original);

  const blocks = formattedBlocks(applyGuideMainFormatRevisions(original));
  assert.deepEqual(original, before);
  assert.deepEqual(blocks.slice(1, 3).map(({ type, text }) => [type, text]), [
    ["list", "Citizen of Heaven — belonging"],
    ["list", "Your New Identity — life in Christ"],
  ]);
  assert.equal(blocks[3].bold, true);
  assert.equal(blocks[4].bold, undefined);
  assert.equal(blocks[5].bold, true);
  assert.deepEqual(blocks[6].boldPhrases, ["A Prayer"]);
});

test("bolds Growth Is God’s Plan for You and converts all five inheritance items to a list", () => {
  const citizen = applyGuideMainFormatRevisions(makeArticle("adv-citizen-of-heaven", [
    paragraph("Growth Is God’s Plan for You"),
  ]));
  assert.equal(formattedBlocks(citizen)[0].bold, true);

  const identity = applyGuideMainFormatRevisions(makeArticle("adv-your-new-identity-christ", [
    heading("Your Inheritance in Christ"),
    ...[
      "• Your sins are completely forgiven",
      "• You become a child of God—forever",
      "• Christ lives in you",
      "• The Holy Spirit is your guarantee",
      "• Christ gives you His new nature",
    ].map((text) => paragraph(text)),
  ]));
  assert.equal(formattedBlocks(identity).filter((block) => block.type === "list").length, 5);
});

test("replaces the Daily Power table and preserves answer lines around it with descriptive alt text", () => {
  const article = makeArticle("adv-the-holy-spirit", [
    paragraph("________________________________________________________________", "answer-line"),
    heading("Your Daily Power"),
    paragraph("Mark where you have been depending on yourself, and where you will depend on God."),
    paragraph("________________________________________________________________", "answer-line"),
    ...dailyPowerRows.map((text) => paragraph(text)),
    paragraph("When you get up in the morning, call on the Holy Spirit."),
    paragraph("________________________________________________________________", "answer-line"),
  ]);
  const blocks = formattedBlocks(applyGuideMainFormatRevisions(article));

  assert.deepEqual(blocks.map((block) => block.type), [
    "answer-line", "heading", "paragraph", "answer-line", "image", "paragraph", "answer-line",
  ]);
  assert.deepEqual(blocks[4], {
    type: "image",
    text: "Daily Power worksheet with My power and God’s power columns for relationships, health or fears, trials or temptations, emotions, school or work, and goals or dreams.",
    src: "guide-daily-power.png",
  });
});

test("marks only Joni’s story body and replaces the Examining Your Trust table", () => {
  const storyText = "Joni Eareckson was an active teenager. Through the steady encouragement of a friend, she began to choose faith.";
  const article = makeArticle("adv-walking-by-faith", [
    paragraph("________________________________________________________________", "answer-line"),
    heading("Overcoming Doubt"),
    paragraph("Joni’s Story"),
    paragraph(storyText),
    heading("Examining Your Trust"),
    paragraph("Mark whether each area is helping or hurting your faith in Christ."),
    paragraph("________________________________________________________________", "answer-line"),
    ...examiningTrustRows.map((text) => paragraph(text)),
    paragraph("Do not conform to the pattern of this world."),
    paragraph("________________________________________________________________", "answer-line"),
  ]);
  const blocks = formattedBlocks(applyGuideMainFormatRevisions(article));
  const storyBody = blocks.find((block) => block.text === storyText);
  const image = blocks.find((block) => block.type === "image");

  assert.equal(storyBody?.presentation, "story");
  assert.equal(storyBody?.text, storyText);
  assert.deepEqual(image, {
    type: "image",
    text: "Examining Your Trust worksheet with Helping and Hurting columns for friends, recreations, habits, time in God’s Word, and thoughts.",
    src: "guide-examining-trust.png",
  });
  assert.equal(blocks.some((block) => block.text === "Area" || block.text === "☐"), false);
  assert.equal(blocks.filter((block) => block.type === "answer-line").length, 3);
});

test("formats prayer bullets and inline labels and expands the combined Acts citations", () => {
  const prayer = applyGuideMainFormatRevisions(makeArticle("adv-prayer", [
    paragraph("• The Holy Spirit helps you pray"),
    paragraph("• Faith makes prayer effective"),
    paragraph("• God’s Word teaches you who He is and how to pray"),
    heading("Relationship, Not Rules"),
    paragraph("Beginning the day: Start with prayer."),
    paragraph("Claiming His promises: Carry a verse."),
    paragraph("Restoring fellowship: Confess and return."),
    paragraph("Thanksgiving and adoration. Give thanks."),
    paragraph("Bringing requests. Ask your Father."),
  ]));
  const prayerBlocks = formattedBlocks(prayer);
  assert.equal(prayerBlocks.slice(0, 3).filter((block) => block.type === "list").length, 3);
  assert.deepEqual(prayerBlocks.slice(4).map(({ text, boldPhrases }) => [text, boldPhrases]), [
    ["Beginning the day: Start with prayer.", ["Beginning the day:"]],
    ["Claiming His promises: Carry a verse.", ["Claiming His promises:"]],
    ["Restoring fellowship: Confess and return.", ["Restoring fellowship:"]],
    ["Thanksgiving and adoration: Give thanks.", ["Thanksgiving and adoration:"]],
    ["Bringing requests: Ask your Father.", ["Bringing requests:"]],
  ]);

  const belonging = applyGuideMainFormatRevisions(makeArticle("adv-belonging-to-gods-family", [
    paragraph("Q: Read Acts 2:42–47, 4:32-35 and 11:27-30. What stands out?"),
    ...Array.from({ length: 6 }, (_, index) => paragraph(`• Belonging step ${index + 1}`)),
  ]));
  assert.equal(
    formattedBlocks(belonging)[0].text,
    "Q: Read Acts 2:42-47, Acts 4:32-35 and Acts 11:27-30. What stands out?",
  );
  assert.equal(formattedBlocks(belonging).filter((block) => block.type === "list").length, 6);
});

test("formats eight foundational truths and six next steps and guards source assumptions", () => {
  const continuing = applyGuideMainFormatRevisions(makeArticle("adv-continuing-with-jesus", [
    ...Array.from({ length: 8 }, (_, index) => paragraph(`• Foundational truth ${index + 1}`)),
    heading("Keep Taking the Next Step"),
    ...Array.from({ length: 6 }, (_, index) => paragraph(`• Next step ${index + 1}`)),
  ]));
  const continuingBlocks = formattedBlocks(continuing);
  assert.equal(continuingBlocks.slice(0, 8).filter((block) => block.type === "list").length, 8);
  assert.equal(continuingBlocks.slice(9).filter((block) => block.type === "list").length, 6);

  const malformedTable = makeArticle("adv-the-holy-spirit", [
    heading("Your Daily Power"),
    paragraph("Daily issue"),
    paragraph("changed worksheet content"),
  ]);
  assert.throws(
    () => applyGuideMainFormatRevisions(malformedTable),
    /Missing or changed Your Daily Power table/,
  );

  const resource = makeArticle("resource", [paragraph("• not a main chapter")], "resources");
  assert.equal(applyGuideMainFormatRevisions(resource), resource);
});