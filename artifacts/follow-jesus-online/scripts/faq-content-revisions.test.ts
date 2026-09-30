import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applyFaqContentRevisions,
  shouldAppendFaqRelatedLink,
} from "../src/data/faq-content-revisions.ts";

type SourceBlock = {
  kind: "heading" | "paragraph" | "question" | "list" | "image";
  text: string;
  links?: { label: string; href: string }[];
};

const readingLinks = JSON.parse(
  readFileSync(new URL("../src/data/faq-reading-links.json", import.meta.url), "utf8"),
) as Record<string, { label: string; href: string }[]>;

test("the real FAQ keeps its Who Is God link and adds Citizen of Heaven under the Christian question", () => {
  const blocks: SourceBlock[] = [
    { kind: "heading", text: "How Do I Know This Is Real?" },
    { kind: "paragraph", text: "This answer belongs below the forgiveness question." },
    { kind: "heading", text: "Has God really forgiven me for my sin?" },
    {
      kind: "paragraph",
      text: "God says He will forgive you. Learn more about who God is >>>",
    },
    {
      kind: "paragraph",
      text: "Learn more about “How to Experience God’s Forgiveness” >>>",
    },
    { kind: "heading", text: "How do I know that I am a Christian?" },
    { kind: "paragraph", text: "God promises you will belong to Him." },
    { kind: "paragraph", text: "“You will be saved.” (Romans 10:9)" },
    { kind: "paragraph", text: "Go to The GUIDE >>>" },
  ];

  const revised = applyFaqContentRevisions("more-received-how-do-i-know-this-is-real", blocks);
  const texts = revised.map((block) => block.text);
  const forgivenessQuestionIndex = texts.findIndex((text) => text.includes("Has God really forgiven"));
  const movedAnswerIndex = texts.findIndex((text) => text.includes("This answer belongs"));
  const citizenPromptIndex = texts.findIndex((text) => text.includes("Learn more about becoming a “Citizen of Heaven”"));
  const romansVerseIndex = texts.findIndex((text) => text.includes("Romans 10:9"));
  const guideIndex = texts.findIndex((text) => text.includes("Go to The GUIDE"));

  assert.equal(movedAnswerIndex, forgivenessQuestionIndex + 1);
  assert.ok(texts.some((text) => text.includes("Learn more about who God is")));
  assert.ok(!texts.some((text) => text.includes("How to Experience God’s Forgiveness")));
  assert.ok(romansVerseIndex < citizenPromptIndex);
  assert.ok(citizenPromptIndex < guideIndex);
  assert.equal(
    readingLinks["more-received-how-do-i-know-this-is-real"].find(
      ({ label }) => label === "Learn more about who God is",
    )?.href,
    "/more-who-is-god",
  );

  const sourceWithAssurance = blocks.map((block) => ({
    ...block,
    text: block.text.replace("Learn more about who God is >>>", "Learn more about “Assurance of Your Salvation” >>>"),
  }));
  const assuranceRevision = applyFaqContentRevisions(
    "more-received-how-do-i-know-this-is-real",
    sourceWithAssurance,
  );
  assert.equal(
    assuranceRevision.filter((block) => block.text.includes("Learn more about becoming a “Citizen of Heaven”")).length,
    1,
  );
});

test("returning relationship FAQ keeps the neighbor-love reading and removes only an Experience God’s Love prompt", () => {
  const receivedRelationshipBlocks = applyFaqContentRevisions(
    "more-received-how-should-i-handle-my-current-relationships",
    [
      { kind: "heading", text: "How Should I Handle My Current Relationships?" },
      { kind: "paragraph", text: "Learn more about God’s Love >>>" },
    ],
  );
  assert.ok(!receivedRelationshipBlocks.some((block) => block.text.includes("God’s Love")));
  assert.equal(
    shouldAppendFaqRelatedLink("more-received-how-should-i-handle-my-current-relationships", "/more-gods-love"),
    false,
  );

  const revised = applyFaqContentRevisions(
    "more-returning-how-should-i-handle-the-relationships-and-patterns-i-left-behind",
    [
      { kind: "heading", text: "How Should I Handle the Relationships?" },
      {
        kind: "paragraph",
        text: "Learn more about how to “Love Your Neighbor as Yourself” >>>",
      },
      { kind: "paragraph", text: "Learn more about how to “Experience God’s Love” >>>" },
    ],
  );

  assert.ok(revised.some((block) => block.text.includes("Love Your Neighbor as Yourself")));
  assert.ok(!revised.some((block) => block.text.includes("Experience God’s Love")));
  assert.equal(
    readingLinks["more-returning-how-should-i-handle-the-relationships-and-patterns-i-left-behind"]
      .find(({ label }) => label.includes("Love Your Neighbor"))?.href,
    "/gf/building-blocks-for-maturity/living-as-gods-family",
  );
  assert.equal(shouldAppendFaqRelatedLink("more-received-how-do-i-know-this-is-real", "/more-who-is-god"), true);
});

test("Luke 15 is captioned and split at verses 17, 20, and 22 without verse markers", () => {
  const passage =
    "15:11 Then Jesus said, “A man had two sons. 15:12 The younger said, ‘Give me my share.’ 15:16 No one gave him anything. 15:17 But when he came to his senses, he said, ‘I will go to my father. 15:18 I have sinned.’ 15:20 So he got up and went to his father. 15:21 Then his son said, ‘I have sinned.’ 15:22 But the father said, ‘Hurry! 15:23 Let us celebrate, 15:24 because my son was lost and is found!’ (Luke 15:11-24)";
  const revised = applyFaqContentRevisions("more-returning-i-feel-ashamed-or-distant", [
    { kind: "heading", text: "I feel ashamed or distant" },
    { kind: "heading", text: "Have you read the story Jesus told?" },
    { kind: "paragraph", text: passage },
    { kind: "paragraph", text: "Nothing will separate us (Romans 8:38-39)." },
  ]);
  const captionIndex = revised.findIndex((block) => block.text === "(Luke 15:11-24)");
  const passageBlocks = revised.filter(
    (block) => block.kind === "paragraph" && !block.text.startsWith("(Luke 15:11-24)") &&
      /Then Jesus said|But when he came|So he got up|But the father said/.test(block.text),
  );

  assert.equal(revised[captionIndex - 1]?.text, "Have you read the story Jesus told?");
  assert.deepEqual(passageBlocks.map(({ text }) => text[0]), ["T", "B", "S", "B"]);
  assert.equal(passageBlocks.length, 4);
  assert.ok(passageBlocks.every(({ text }) => !/\b15:\d+\b/.test(text)));
  assert.ok(revised.some((block) => block.text.includes("\u00a0(Romans 8:38-39)")));
});

test("returning evidence prompts use the requested labels and destinations", () => {
  const revised = applyFaqContentRevisions("more-returning-other-questions", [
    { kind: "heading", text: "More Questions" },
    { kind: "heading", text: "How do I know Christianity is actually true?" },
    {
      kind: "paragraph",
      text: "Examine the evidence for yourself >>>",
      links: [{ label: "Examine the evidence for yourself >>>", href: "/evidence" }],
    },
    { kind: "heading", text: "Can I trust the Bible again?" },
    {
      kind: "paragraph",
      text: "Examine the evidence for yourself >>>",
      links: [{ label: "Examine the evidence for yourself >>>", href: "/evidence" }],
    },
  ]);

  assert.equal(revised[2].text, "Examine the evidence for Jesus’ true identity >>>");
  assert.equal(revised[2].links?.[0].href, "https://app.jesusonline.com/series/73");
  assert.equal(revised[4].text, "Examine the evidence for the reliability of the Bible >>>");
  assert.equal(revised[4].links?.[0].href, "https://app.jesusonline.com/series/72");
});

test("the v.092926 FAQ retains its four approved DOCX link destinations", () => {
  const revised = applyFaqContentRevisions("more-returning-i-want-to-know-jesus-more-deeply", []);
  const hrefs = revised.flatMap((block) => block.links?.map(({ href }) => href) ?? []);

  assert.ok(hrefs.includes("/adv/gods-word"));
  assert.ok(hrefs.includes("/adv/prayer"));
  assert.ok(hrefs.includes("/adv/belonging-to-gods-family"));
  assert.ok(hrefs.includes("/message"));
  assert.equal(
    readingLinks["more-returning-i-want-to-know-jesus-more-deeply"].find(
      ({ label }) => label === "Learn the habits",
    )?.href,
    "/more-seven-habits-for-intimacy-with-god",
  );
});