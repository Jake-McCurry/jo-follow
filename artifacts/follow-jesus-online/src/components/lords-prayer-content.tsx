import type { ReactNode } from "react";
import type { ArticleBlock } from "@/data/article-library";

const calloutStyles: Record<string, string> = {
  SCRIPTURE: "border-warm-700 bg-[#f4ede2]",
  REFLECT: "border-[#416e60] bg-[#eaf1ec]",
  "A PRAYER": "border-navy bg-[#e7eef6]",
};

/** Keep the former image panels as responsive, selectable, accessible text. */
export function LordsPrayerContent({ blocks, renderBlock }: {
  blocks: ArticleBlock[];
  renderBlock: (block: ArticleBlock, index: number) => ReactNode;
}) {
  const content: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const style = block.type === "heading" ? calloutStyles[block.text] : undefined;
    if (style) {
      const start = i;
      const body: ReactNode[] = [];
      while (i + 1 < blocks.length && blocks[i + 1].type === "paragraph" && !blocks[i + 1].links?.length) {
        i++;
        body.push(renderBlock(blocks[i], i));
      }
      content.push(
        <section key={start} aria-label={block.text} className={`my-4 border-l-4 px-4 py-4 sm:px-5 ${style}`}>
          <h3 className="mb-2 text-sm font-bold tracking-wide text-navy">{block.text}</h3>
          <div className="break-words [&>p]:mb-3 [&>p]:text-base [&>p]:leading-relaxed [&>p:last-child]:mb-0 sm:[&>p]:text-lg">
            {body}
          </div>
        </section>,
      );
    } else if (block.type === "list") {
      const start = i;
      const items: ReactNode[] = [renderBlock(block, i)];
      while (blocks[i + 1]?.type === "list") {
        i++;
        items.push(renderBlock(blocks[i], i));
      }
      content.push(<ul key={start} className="my-5 list-disc space-y-3 pl-2">{items}</ul>);
    } else {
      content.push(renderBlock(block, i));
    }
  }
  return <>{content}</>;
}
