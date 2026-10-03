import { ChevronDown, ChevronRight, Printer, Search } from "lucide-react";
import { type Book, printedTranslations } from "./promises-data";

export type View = "overview" | "intro" | "source" | "saved" | "topic";
const sel = "bg-[var(--color-selected-warm,#FFEADB)] shadow-[inset_0_0_0_1px_var(--color-action-warm,#C45100)]";
const lab = "mb-1 text-xs font-bold uppercase tracking-[.2em] text-[var(--color-action-warm,#C45100)]";

type Props = {
  book: Book; view: View; selectedId: string; expanded: string; query: string; savedCount: number;
  translation: string; onTranslation: (v: string) => void; onQuery: (v: string) => void;
  onView: (v: View) => void; onTopic: (id: string) => void; onToggleGroup: (id: string) => void;
};

export function PromisesSidebar(p: Props) {
  const nav = (v: View, label: string) => <button type="button" onClick={() => p.onView(v)} aria-current={p.view === v && !p.query ? "page" : undefined}
    className={`kg-focus w-full border-l-4 px-3 py-2 text-left text-base ${p.view === v && !p.query ? `border-[var(--color-action-warm,#C45100)] ${sel}` : "border-transparent hover:bg-[var(--color-surface,#fffaf2)]"}`}>{label}{v === "saved" ? ` (${p.savedCount})` : ""}</button>;
  return <div className="p-5" style={{ fontFamily: "var(--font-sans)" }}>
    <button type="button" onClick={() => window.print()} className="kg-focus mb-5 flex w-full items-center justify-center gap-2 rounded border border-[var(--color-border-control,#9a866d)] bg-[var(--color-surface,#fffaf2)] px-3 py-2 font-bold"><Printer size={16} />Print</button>
    <p className={lab}>Translation as printed</p>
    <label className="sr-only" htmlFor="promises-translation">Filter passages by translation</label>
    <select id="promises-translation" value={p.translation} onChange={e => p.onTranslation(e.target.value)}
      className="kg-focus mb-5 w-full border border-[var(--color-border-control)] bg-[var(--color-surface)] p-2 text-base">
      <option value="all">All printed translations</option>
      {printedTranslations(p.book).map(t => <option key={t} value={t}>{t}</option>)}
    </select>
    <label htmlFor="promises-search" className="sr-only">Search all promises by title, text, or reference</label>
    <div className="relative mb-5"><Search className="absolute left-3 top-3 text-[var(--color-text-muted,#655f55)]" size={16} />
      <input id="promises-search" type="search" value={p.query} onChange={e => p.onQuery(e.target.value)} placeholder="Search all promises" className="kg-focus w-full border border-[var(--color-border-control,#9a866d)] bg-[var(--color-surface,#fffaf2)] py-2.5 pl-9 pr-3 text-base" /></div>
    <nav aria-label="Promises navigation">
      <div className="mb-4 border-b border-[var(--color-border-soft,#d9cdb9)] pb-4">{nav("overview", "Overview")}{nav("intro", "Introduction")}{nav("saved", "Saved study")}{nav("source", "About, source and resources")}</div>
      <p className={lab}>Six groups</p>
      <ul className="m-0 list-none p-0">
        {p.book.groups.map(g => {
          const open = p.expanded === g.id;
          return <li key={g.id} className="border-b border-[var(--color-border-soft,#d9cdb9)]">
            <button type="button" aria-expanded={open} aria-controls={`pg-${g.id}`} onClick={() => p.onToggleGroup(g.id)} className="kg-focus flex w-full items-center justify-between gap-2 py-3 text-left text-base font-bold text-[var(--color-hero,#29474b)]">
              <span>{g.title}</span><span className="flex items-center gap-1 text-xs font-normal text-[var(--color-text-muted,#655f55)]">{g.topics.length}{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span></button>
            {open && <div id={`pg-${g.id}`} className="pb-2">{g.topics.map(t => <button key={t.id} type="button" aria-pressed={p.view === "topic" && p.selectedId === t.id && !p.query} onClick={() => p.onTopic(t.id)}
              className={`kg-focus block w-full border-l-4 px-3 py-2 text-left text-base ${p.view === "topic" && p.selectedId === t.id && !p.query ? `border-[var(--color-action-warm,#C45100)] ${sel}` : "border-transparent hover:bg-[var(--color-surface,#fffaf2)]"}`}>{t.title}</button>)}</div>}
          </li>;
        })}
      </ul>
    </nav>
  </div>;
}
