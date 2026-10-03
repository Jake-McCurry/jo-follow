import { type Block, scriptureHref } from "./promises-data";

export function PromiseBlocks({ blocks, translation = "all", level = 3 }: { blocks: Block[]; translation?: string; level?: 2 | 3 }) {
  const H = (level === 2 ? "h2" : "h3") as "h2" | "h3";
  return <div className="space-y-5">
    {blocks.filter(b => b.kind !== "passage" || translation === "all" || b.translation === translation).map((b, i) => {
      if (b.kind === "heading") return <H key={i} className="mt-8 text-2xl text-[var(--color-hero,#29474b)] whitespace-pre-line">{b.text}</H>;
      if (b.kind === "passage") {
        const href = scriptureHref(b.bibleReference ?? b.reference);
        return <article key={i} className="border-l-4 border-[var(--color-action-warm,#C45100)] bg-[var(--color-surface-soft,#f3ede2)] px-5 py-4">
          <p className="whitespace-pre-line text-lg leading-[1.75] text-[var(--color-text,#394b4b)]">{b.text}</p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted,#655f55)]" style={{ fontFamily: "var(--font-sans)" }}>
            {href && <a href={href} className="font-bold text-[var(--color-hero,#29474b)] underline underline-offset-2">Read {b.reference} in Follow</a>}
            {b.translation && <span>Printed in {b.translation}</span>}
          </p>
          {b.referenceNote && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{b.referenceNote}</p>}
        </article>;
      }
      return <p key={i} className="whitespace-pre-line text-lg leading-[1.75] text-[var(--color-text,#394b4b)]">{b.text}</p>;
    })}
  </div>;
}
