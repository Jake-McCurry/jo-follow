import type { ReactNode } from "react";
import type { ArticleBlock } from "@/data/article-library";

interface PrayerGuideContentProps {
  blocks: ArticleBlock[];
  renderBlock: (block: ArticleBlock, index: number) => ReactNode;
}

export function PrayerGuideContent({ blocks, renderBlock }: PrayerGuideContentProps) {
  const sections: { blocks: ArticleBlock[]; isArticle: boolean }[] = [];

  for (const block of blocks) {
    if (block.type === "list") continue;
    if ((block.type === "heading" && block.headingLevel !== 3) || sections.length === 0) {
      sections.push({
        blocks: [],
        isArticle: block.type === "heading" &&
          Boolean(block.links?.some((link) => link.href.startsWith("/prayer/") || link.href.startsWith("/lords-prayer/"))),
      });
    }
    sections[sections.length - 1].blocks.push(block);
  }

  return (
    <div className="space-y-5" data-testid="prayer-guide-content">
      {sections.map((section, index) => (
        <section
          key={index}
          data-testid={section.isArticle ? "prayer-article-card" : undefined}
          className={`prose prose-lg max-w-none dark:prose-invert [&_h2]:mt-0 [&_h3]:mt-0 [&_p:last-child]:mb-0 ${
            section.isArticle
              ? "rounded-2xl border border-card-border bg-card p-6 shadow-sm sm:p-8"
              : "py-2"
          }`}
        >
          {section.blocks.map(renderBlock)}
        </section>
      ))}
    </div>
  );
}
