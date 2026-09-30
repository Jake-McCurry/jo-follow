import assert from "node:assert/strict";
import test from "node:test";
import { applyBelieverResourceRevisions } from "../src/data/believer-resource-revisions.ts";

type SourceBlock = {
  kind: "heading" | "paragraph" | "question" | "list" | "image";
  text: string;
  headingLevel?: 2 | 3;
  links?: { label: string; href: string }[];
};

test("Refresh the Foundation sends all four PDF links to direct PDF downloads", () => {
  const blocks: SourceBlock[] = [
    { kind: "heading", text: "Refresh the Foundation" },
    {
      kind: "paragraph",
      text: "Read the book in PDF >>>",
      links: [{
        label: "Read the book in PDF >>>",
        href: "https://equip.jesusonline.com/books/a-heart-after-god",
      }],
    },
    {
      kind: "paragraph",
      text: "Read the book in PDF >>>",
      links: [{
        label: "Read the book in PDF >>>",
        href: "https://equip.jesusonline.com/books/your-new-identity-in-christ",
      }],
    },
    {
      kind: "paragraph",
      text: "Read the book in PDF >>>",
      links: [{
        label: "Read the book in PDF >>>",
        href: "https://equip.jesusonline.com/books/beholding-the-majesty-of-god",
      }],
    },
    {
      kind: "paragraph",
      text: "Read the book in PDF >>>",
      links: [{
        label: "Read the book in PDF >>>",
        href: "https://equip.jesusonline.com/books/walking-in-the-spirit.pdf",
      }],
    },
  ];
  const original = structuredClone(blocks);

  const revised = applyBelieverResourceRevisions("more-believer-refresh-the-foundation", blocks);
  const hrefs = revised.flatMap((block) => block.links?.map((link) => link.href) ?? []);

  assert.deepEqual(blocks, original);
  assert.deepEqual(hrefs, [
    "https://equip.jesusonline.com/books?download=a-heart-after-god",
    "https://equip.jesusonline.com/books?download=your-new-identity-in-christ",
    "https://equip.jesusonline.com/books?download=beholding-the-majesty-of-god",
    "https://equip.jesusonline.com/books/walking-in-the-spirit.pdf",
  ]);
  assert.ok(hrefs.every((href) => /\.pdf(?:[?#]|$)/i.test(href) || /\/books\?download=/.test(href)));
});

test("new-believer guide points to the approved local Adventure Guide PDF without changing other links", () => {
  const blocks: SourceBlock[] = [
    { kind: "heading", text: "Help Someone New in Faith" },
    {
      kind: "paragraph",
      text: "Go to equip.jesusonline.com and access The Adventure of Living with Jesus PDF",
      links: [
        { label: "equip.jesusonline.com", href: "https://equip.jesusonline.com/" },
        {
          label: "The Adventure of Living with Jesus PDF",
          href: "https://equip.jesusonline.com/books/adventure-of-living-with-jesus",
        },
      ],
    },
  ];
  const original = structuredClone(blocks);

  const revised = applyBelieverResourceRevisions("more-believer-help-someone-new-in-faith", blocks);

  assert.deepEqual(blocks, original);
  assert.equal(revised[1].links?.[0].href, "https://equip.jesusonline.com/");
  assert.equal(revised[1].links?.[1].href, "/adventure-guide.pdf");
});

test("Developing Biblical Perspective uses the requested sentence and keeps the following sentence", () => {
  const blocks: SourceBlock[] = [
    { kind: "heading", text: "Revisit a specific area of spiritual growth" },
    { kind: "heading", text: "Developing Biblical Perspective" },
    {
      kind: "paragraph",
      text: "With a new perspective, everything is different even though nothing has changed. Seeing your life from God’s perspective is just as important as the truth that you are a new creation in Christ.",
    },
  ];

  const revised = applyBelieverResourceRevisions(
    "more-believer-revisit-a-specific-area-of-spiritual-growth",
    blocks,
  );

  assert.equal(
    revised[2].text,
    "With God’s perspective, everything is different even though nothing has changed. Seeing your life from God’s perspective is just as important as the truth that you are a new creation in Christ.",
  );
});

test("conversation resource titles and Gospel subsections have the requested heading hierarchy", () => {
  const blocks: SourceBlock[] = [
    { kind: "heading", text: "Find Clear Language for Conversations with Others" },
    { kind: "heading", text: "JO App" },
    { kind: "heading", text: "RESOURCES" },
    {
      kind: "paragraph",
      text: "JO EQUIP (equip.jesusonline.com)",
      links: [{ label: "equip.jesusonline.com", href: "https://equip.jesusonline.com/" }],
    },
    { kind: "paragraph", text: "JO EQUIP is a resource hub for disciple-makers." },
    { kind: "paragraph", text: "Y-Jesus.org" },
    { kind: "paragraph", text: "Keep this unrelated explanatory text." },
    {
      kind: "paragraph",
      text: "JO App (app.jesusonline.com)",
      links: [{ label: "app.jesusonline.com", href: "https://app.jesusonline.com/" }],
    },
    { kind: "heading", text: "The Gospel" },
    { kind: "heading", text: "God Loves You" },
    { kind: "heading", text: "Jesus Christ—God’s Solution" },
    { kind: "heading", text: "New Life in Christ" },
    { kind: "heading", text: "It’s Your Choice" },
  ];
  const original = structuredClone(blocks);

  const revised = applyBelieverResourceRevisions(
    "more-believer-find-clear-language-for-conversations-with-others",
    blocks,
  );

  assert.deepEqual(blocks, original);
  assert.deepEqual(
    revised.filter((block) => ["JO EQUIP (equip.jesusonline.com)", "Y-Jesus.org", "JO App (app.jesusonline.com)"].includes(block.text))
      .map(({ kind, headingLevel }) => ({ kind, headingLevel })),
    [
      { kind: "heading", headingLevel: 3 },
      { kind: "heading", headingLevel: 3 },
      { kind: "heading", headingLevel: 3 },
    ],
  );
  assert.deepEqual(
    revised.filter((block) => block.text === "The Gospel" || block.text === "God Loves You" ||
      block.text === "Jesus Christ—God’s Solution" || block.text === "New Life in Christ" ||
      block.text === "It’s Your Choice")
      .map(({ text, headingLevel }) => ({ text, headingLevel })),
    [
      { text: "The Gospel", headingLevel: 2 },
      { text: "God Loves You", headingLevel: 3 },
      { text: "Jesus Christ—God’s Solution", headingLevel: 3 },
      { text: "New Life in Christ", headingLevel: 3 },
      { text: "It’s Your Choice", headingLevel: 3 },
    ],
  );
  assert.equal(revised[1].headingLevel, undefined);
  assert.equal(revised[4].text, "JO EQUIP is a resource hub for disciple-makers.");
  assert.equal(revised[7].links?.[0].href, "https://app.jesusonline.com/");
});

test("unrelated routes get independent block copies without editorial changes", () => {
  const source: SourceBlock[] = [
    { kind: "heading", text: "JO App" },
    { kind: "paragraph", text: "A paragraph.", links: [{ label: "A link", href: "/destination" }] },
  ];

  const revised = applyBelieverResourceRevisions("another-route", source);

  assert.deepEqual(revised, source);
  assert.notEqual(revised, source);
  assert.notEqual(revised[1], source[1]);
  assert.notEqual(revised[1].links, source[1].links);
  assert.notEqual(revised[1].links?.[0], source[1].links?.[0]);
});