import assert from "node:assert/strict";
import test from "node:test";
import { REWATCH_VIDEOS } from "../src/data/rewatch-videos";

test("videos use the requested order and verified Total Life Discipleship IDs", () => {
  assert.deepEqual(REWATCH_VIDEOS.map(({ id, title }) => ({ id, title })), [
    { id: "SEg4a2xaJyw", title: "Jesus’ Resurrection and You" },
    { id: "XB7wGTnYeaE", title: "The Gift of Heaven" },
    { id: "psw_5rn9WFY", title: "God’s Vision" },
    { id: "56GWpb0F2qU", title: "Personal Transformation" },
    { id: "Wq2g9GTgc_Q", title: "Eternal Impact" },
  ]);
});

test("published transcripts include their full text, without unrelated response forms", () => {
  for (const video of REWATCH_VIDEOS.slice(0, 2)) {
    assert.ok(video.transcript);
    assert.ok(video.transcript.blocks.length > 20);
    const text = video.transcript.blocks.map((block) => block.text).join("\n");
    assert.ok(text.length > 5000);
    assert.match(text, /Dear Lord Jesus/);
    assert.doesNotMatch(text, /What is your response\?|comment box below|<[^>]+>/);
    assert.match(video.transcript.sourceUrl ?? "", /^https:\/\/app\.jesusonline\.com\/post\//);
  }
});

test("all three supplied scripts are matched to their videos, not related study articles", () => {
  const headings = [
    "Total Life Discipleship Requires God’s Vision",
    "Total Life Discipleship Involves Personal Transformation",
    "Total Life Discipleship Results in Eternal Impact",
  ];
  for (const [index, video] of REWATCH_VIDEOS.slice(2).entries()) {
    assert.ok(video.transcript);
    assert.match(video.transcript.sourceDocument ?? "", /^Total_Life_Discipleship_Overview_Videos_.*\.docx$/);
    assert.equal(video.transcript.sourceHeading, headings[index]);
    assert.equal(video.transcript.blocks[0].text, headings[index]);
    assert.ok(video.transcript.blocks.length >= 15);
    assert.ok(video.transcript.blocks.map(block => block.text).join("\n").length > 2000);
  }
});