import { ChevronDown, ChevronRight, Printer } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { type Book } from "./promises-data";

export type View = "intro" | "source" | "saved" | "topic";
const sel = "bg-[var(--color-selected-warm,#FFEADB)] shadow-[inset_0_0_0_1px_var(--color-action-warm,#C45100)]";
const lab = "mb-1 text-xs font-bold uppercase tracking-[.2em] text-[var(--color-action-warm,#C45100)]";

type Props = {
  book: Book; view: View; selectedId: string; expanded: string; savedCount: number;
  onView: (v: View) => void; onTopic: (id: string) => void; onToggleGroup: (id: string) => void;
};

export function PromisesSidebar(p: Props) {
  return <div className="flex min-h-full flex-col p-5 md:min-h-[calc(100dvh-var(--kg-header-height,95px))]" style={{ fontFamily: "var(--font-sans)" }}>
    <h2 data-testid="heading-promises-sidebar" className="-mx-5 -mt-5 mb-5 border-b border-[var(--color-border-soft,#C9D6E1)] bg-[var(--color-surface-soft,#E5EDF4)] px-5 py-4 text-2xl font-bold text-[var(--color-hero,#17384D)]">Promises of God</h2>
    <nav aria-label="Promises navigation">
      <button type="button" onClick={() => p.onView("intro")} aria-current={p.view === "intro" ? "page" : undefined}
        className="kg-focus mb-5 w-full rounded-md bg-[var(--color-structure,#003A66)] px-4 py-2.5 text-center text-base font-bold text-white shadow-sm hover:opacity-90">Introduction</button>
      <p className={lab}>Six groups</p>
      <ul className="m-0 list-none p-0">
        {p.book.groups.map(g => {
          const open = p.expanded === g.id;
          return <li key={g.id} className="border-b border-[var(--color-border-soft,#d9cdb9)]">
            <button type="button" aria-expanded={open} aria-controls={`pg-${g.id}`} onClick={() => p.onToggleGroup(g.id)} className="kg-focus flex w-full items-center justify-between gap-2 py-3 text-left text-base font-bold text-[var(--color-hero,#29474b)]">
              <span>{g.title}</span><span className="flex items-center gap-1 text-xs font-normal text-[var(--color-text-muted,#655f55)]">{g.topics.length}{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span></button>
            {open && <div id={`pg-${g.id}`} className="pb-2">{g.topics.map(t => <button key={t.id} type="button" aria-pressed={p.view === "topic" && p.selectedId === t.id} onClick={() => p.onTopic(t.id)}
              className={`kg-focus block w-full border-l-4 px-3 py-2 text-left text-base ${p.view === "topic" && p.selectedId === t.id ? `border-[var(--color-action-warm,#C45100)] ${sel}` : "border-transparent hover:bg-[var(--color-surface,#fffaf2)]"}`}>{t.title}</button>)}</div>}
          </li>;
        })}
      </ul>
    </nav>
    <footer data-testid="promises-sidebar-footer" className="mt-auto border-t border-[var(--color-border-soft,#C8D3C1)] pt-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => p.onView("saved")} aria-current={p.view === "saved" ? "page" : undefined}
          className="kg-focus py-2 text-sm text-[var(--color-text-muted,#435C70)] hover:underline">Saved study ({p.savedCount})</button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => window.print()} aria-label="Print this page" title="Print"
            className="kg-focus flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-text-muted,#435C70)] hover:bg-[var(--color-surface,#F4F7F0)] md:h-9 md:w-9"><Printer size={16} aria-hidden="true" /></button>
          <ShareButton title={p.book.title} text="Read God’s Promises for Hope."
            label={<span className="sr-only">Share this page</span>} variant="ghost"
            className="kg-focus h-11 w-11 p-0 text-[var(--color-text-muted,#435C70)] hover:bg-[var(--color-surface,#F4F7F0)] [&_svg]:mr-0 md:h-9 md:w-9" />
        </div>
      </div>
      <button type="button" onClick={() => p.onView("source")} aria-current={p.view === "source" ? "page" : undefined}
        className="kg-focus mt-1 py-2 text-xs text-[var(--color-text-muted,#435C70)] hover:underline">Copyright</button>
    </footer>
  </div>;
}
