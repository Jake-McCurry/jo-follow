import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { GO_FURTHER_BOOKS } from "../src/data/go-further-library.ts";

const source = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");

test("four books have verified eBook destinations; Building Blocks has none", () => {
  assert.equal(GO_FURTHER_BOOKS.filter(book => book.ebookHref).length, 4);
  for (const book of GO_FURTHER_BOOKS.filter(book => book.ebookHref)) {
    assert.equal(book.ebookHref, `https://equip.jesusonline.com/books/${book.slug}.pdf`);
  }
  assert.equal(GO_FURTHER_BOOKS.find(book => book.slug === "building-blocks-for-maturity")?.ebookHref, undefined);
  const page = source("pages/gf/book.tsx");
  assert.ok(page.indexOf("Download eBook") < page.indexOf("Contents of"));
});

test("navigation and footer use the requested destinations and labels", () => {
  const layout = source("components/layout.tsx");
  for (const value of ['href="/connect-with-god"', 'href="/knowing-god"', 'Questions &amp; Comments', "About Us", "Contact Us"]) {
    assert.ok(layout.includes(value), value);
  }
  assert.ok(!layout.includes('href="/#connect-with-god"'));
  assert.ok(!layout.includes("Saved Bible Items"));
  assert.ok(source("App.tsx").includes('<Route path="/connect-with-god" component={ConnectWithGodPage} />'));
});

test("home and XP contact panels omit removed section and bubble icon", () => {
  assert.ok(!source("pages/home.tsx").includes("More Ways to Explore"));
  assert.ok(!source("pages/xp-page.tsx").includes("MessageCircle"));
});

test("Promises mobile index starts open and Scripture flows without forced line breaks", () => {
  assert.ok(source("components/promises/PromisesReader.tsx").includes("[menu, setMenu] = useState(true)"));
  assert.match(source("components/promises/PromiseBlocks.tsx"), /className="whitespace-normal[^"]*">\{b\.text\}/);
});

test("verse tools precede RECAP on mobile and expose the study-tools jump target", () => {
  const reader = source("pages/bible-reader.tsx");
  assert.ok(reader.includes('className="order-2 lg:order-1"'));
  assert.ok(reader.includes('className="order-3 lg:order-3"'));
  assert.ok(reader.includes('href="#choose-a-verse"'));
  assert.ok(source("components/bible-study-tools.tsx").includes('id="choose-a-verse"'));
});
