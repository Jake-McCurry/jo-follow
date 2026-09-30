import type { FaqSourceBlock } from "./faq-content-revisions";

const foundationPdfDownloads: Record<string, string> = {
  "https://equip.jesusonline.com/books/a-heart-after-god":
    "https://equip.jesusonline.com/books?download=a-heart-after-god",
  "https://equip.jesusonline.com/books/your-new-identity-in-christ":
    "https://equip.jesusonline.com/books?download=your-new-identity-in-christ",
  "https://equip.jesusonline.com/books/beholding-the-majesty-of-god":
    "https://equip.jesusonline.com/books?download=beholding-the-majesty-of-god",
};

function publicAssetHref(fileName: string) {
  const baseUrl = import.meta.env?.BASE_URL ?? "/";
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}${fileName.replace(/^\/+/, "")}`;
}

function cloneBlock(block: FaqSourceBlock): FaqSourceBlock {
  return {
    ...block,
    ...(block.links ? { links: block.links.map((link) => ({ ...link })) } : {}),
  };
}

function reviseFoundationPdfLinks(blocks: FaqSourceBlock[]) {
  let pdfLinkCount = 0;
  const revised = blocks.map((block) => {
    if (!block.links?.some((link) => link.label === "Read the book in PDF >>>")) {
      return block;
    }

    const links = block.links.map((link) => {
      if (link.label !== "Read the book in PDF >>>") return link;
      pdfLinkCount += 1;
      const href = foundationPdfDownloads[link.href];
      if (href) return { ...link, href };
      if (/\.pdf(?:[?#]|$)/i.test(link.href) || /\/books\?download=[a-z0-9-]+$/i.test(link.href)) {
        return link;
      }
      throw new Error(`Refresh the Foundation has an unverified book-PDF destination: ${link.href}`);
    });
    return { ...block, links };
  });

  if (pdfLinkCount !== 4) {
    throw new Error(`Refresh the Foundation should have four “Read the book in PDF” links; found ${pdfLinkCount}.`);
  }
  return revised;
}

function reviseResourcesAndGospelHeadings(blocks: FaqSourceBlock[]) {
  const resourcesIndex = blocks.findIndex(
    (block) => block.kind === "heading" && block.text === "RESOURCES",
  );
  if (resourcesIndex < 0) {
    throw new Error("The believer conversation resource page is missing its RESOURCES heading.");
  }

  let gospelIndex = -1;
  const resourceTitles = new Set([
    "JO EQUIP (equip.jesusonline.com)",
    "Y-Jesus.org",
    "JO App (app.jesusonline.com)",
  ]);
  const gospelTitles = new Set([
    "God Loves You",
    "Jesus Christ—God’s Solution",
    "New Life in Christ",
    "It’s Your Choice",
  ]);
  let foundResourceTitles = 0;
  let foundGospelTitles = 0;
  const revised = blocks.map((block, index) => {
    if (block.kind === "heading" && block.text === "The Gospel") {
      gospelIndex = index;
      return { ...block, headingLevel: 2 as const };
    }
    if (index > resourcesIndex && block.kind === "paragraph" && resourceTitles.has(block.text)) {
      foundResourceTitles += 1;
      return { ...block, kind: "heading" as const, headingLevel: 3 as const };
    }
    return block;
  });

  if (foundResourceTitles !== resourceTitles.size) {
    throw new Error(`The believer conversation resources should have three resource titles; found ${foundResourceTitles}.`);
  }
  if (gospelIndex < 0) {
    throw new Error("The believer conversation resource page is missing its The Gospel heading.");
  }

  for (let index = gospelIndex + 1; index < revised.length; index += 1) {
    const block = revised[index];
    if (block.kind !== "heading" || !gospelTitles.has(block.text)) continue;
    foundGospelTitles += 1;
    revised[index] = { ...block, headingLevel: 3 };
  }
  if (foundGospelTitles !== gospelTitles.size) {
    throw new Error(`The Gospel should have four level-three headings; found ${foundGospelTitles}.`);
  }

  return revised;
}

export function applyBelieverResourceRevisions(
  route: string,
  sourceBlocks: FaqSourceBlock[],
): FaqSourceBlock[] {
  const normalizedRoute = route.replace(/^\/+/, "");
  let blocks = sourceBlocks.map(cloneBlock);

  if (normalizedRoute === "more-believer-refresh-the-foundation") {
    blocks = reviseFoundationPdfLinks(blocks);
  }

  if (normalizedRoute === "more-believer-help-someone-new-in-faith") {
    const guideHref = publicAssetHref("adventure-guide.pdf");
    blocks = blocks.map((block) => ({
      ...block,
      ...(block.links
        ? {
            links: block.links.map((link) =>
              link.label === "The Adventure of Living with Jesus PDF"
                ? { ...link, href: guideHref }
                : link,
            ),
          }
        : {}),
    }));
  }

  if (normalizedRoute === "more-believer-revisit-a-specific-area-of-spiritual-growth") {
    const requestedSentence = "With God’s perspective, everything is different even though nothing has changed.";
    let revisedPerspective = false;
    blocks = blocks.map((block) => {
      if (
        !revisedPerspective &&
        block.kind === "paragraph" &&
        block.text.startsWith("With a new perspective, everything is different even though nothing has changed.")
      ) {
        revisedPerspective = true;
        return {
          ...block,
          text: block.text.replace(
            "With a new perspective, everything is different even though nothing has changed.",
            requestedSentence,
          ),
        };
      }
      return block;
    });
    if (!revisedPerspective) {
      throw new Error("The spiritual-growth resource page is missing its Developing Biblical Perspective introduction.");
    }
  }

  if (normalizedRoute === "more-believer-find-clear-language-for-conversations-with-others") {
    blocks = reviseResourcesAndGospelHeadings(blocks);
  }

  return blocks;
}