import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Bookmark, BookmarkCheck, Copy, Download, Menu } from "lucide-react";
import { pushTopicHash, subscribeToTopicHistory, topicIdFromHash } from "../knowing-god/topic-history.mjs";
import { type Book, base, blockText, readSaved, searchTopics, writeSaved } from "./promises-data";
import { PromiseBlocks } from "./PromiseBlocks";
import { PromisesSidebar, type View } from "./PromisesSidebar";

const eyebrow = "text-xs font-bold uppercase tracking-[.22em] text-[var(--color-action-warm,#C45100)]";
const act = "kg-focus inline-flex min-h-11 items-center gap-2 py-2 text-sm font-bold hover:underline underline-offset-4";

export function PromisesReader() {
  const [book, setBook] = useState<Book | null>(null);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [view, setView] = useState<View>("overview");
  const [selectedId, setSelectedId] = useState("");
  const [expanded, setExpanded] = useState("");
  const [query, setQuery] = useState("");
  const [translation, setTranslation] = useState("all");
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [storageError, setStorageError] = useState("");
  const [savedReady, setSavedReady] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  const reading = useRef<HTMLElement>(null);

  useEffect(() => {
    let live = true; setLoadError("");
    fetch(base("/promises/book.json")).then(r => { if (!r.ok) throw new Error(`Unable to load the book (${r.status}).`); return r.json() as Promise<Book>; })
      .then(d => { if (live) setBook(d); }).catch(e => { if (live) setLoadError(e instanceof Error ? e.message : "Unable to load the book."); });
    return () => { live = false; };
  }, [retry]);

  const topicIndex = useMemo(() => {
    const m = new Map<string, { topic: Book["groups"][0]["topics"][0]; group: Book["groups"][0] }>();
    book?.groups.forEach(group => group.topics.forEach(topic => m.set(topic.id, { topic, group })));
    return m;
  }, [book]);

  useEffect(() => {
    if (!book) return;
    const r = readSaved(); setStorageError(r.error);
    setSaved(r.ids.filter(id => topicIndex.has(id))); setSavedReady(true);
  }, [book, topicIndex]);

  const applyHash = useCallback(() => {
    const id = topicIdFromHash(window.location.hash);
    const hit = id ? topicIndex.get(id) : undefined;
    if (hit) { setSelectedId(hit.topic.id); setExpanded(hit.group.id); setView("topic"); setQuery(""); setFocusTick(t => t + 1); }
    else {
      const requested = new URLSearchParams(window.location.hash.slice(1)).get("view");
      setView(requested === "intro" || requested === "source" || requested === "saved" ? requested : "overview");
      setQuery("");
      if (requested) setFocusTick(t => t + 1);
    }
    setMenu(false);
  }, [topicIndex]);
  useEffect(() => {
    if (!book) return;
    if (window.location.hash) applyHash();
    else setExpanded("");
    return subscribeToTopicHistory(window, applyHash);
  }, [book, applyHash]);

  const openTopic = (id: string) => {
    const hit = topicIndex.get(id); if (!hit) return;
    const same = view === "topic" && selectedId === id && !query;
    setQuery(""); setSelectedId(id); setExpanded(hit.group.id); setView("topic"); setMenu(false); setFocusTick(t => t + 1);
    if (!same || topicIdFromHash(window.location.hash) !== id) pushTopicHash(window, id);
  };
  const openView = (v: View) => {
    setQuery(""); setView(v); setMenu(false); setFocusTick(t => t + 1);
    const hash = v === "overview" ? "" : `#view=${v}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", window.location.pathname + window.location.search + hash);
    }
  };

  useEffect(() => {
    if (!focusTick || !reading.current) return;
    const el = reading.current; el.focus({ preventScroll: true });
    const h = document.querySelector("[data-site-header]")?.getBoundingClientRect().height ?? 0;
    if (window.matchMedia("(max-width: 767px)").matches) window.scrollTo({ top: Math.max(0, window.scrollY + el.getBoundingClientRect().top - h - 8), behavior: "instant" });
  }, [focusTick]);

  const flash = (ok: boolean, msg: string) => { setStatus({ ok, msg }); window.setTimeout(() => setStatus(null), 4000); };
  const copy = async (text: string, label: string) => {
    try { if (!navigator.clipboard?.writeText) throw new Error(); await navigator.clipboard.writeText(text); flash(true, `${label} copied.`); }
    catch { flash(false, "Copy failed. Your browser blocked clipboard access; please select the text and copy it manually."); }
  };
  const toggleSave = (id: string) => {
    if (!savedReady) return;
    const next = saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
    setSaved(next);
    setStorageError(writeSaved(next));
  };
  const results = useMemo(() => book ? searchTopics(book, query) : [], [book, query]);

  if (loadError) return <div role="alert" className="mx-auto max-w-xl px-5 py-20 text-center text-lg"><AlertCircle className="mx-auto mb-3" />{loadError}<div><button type="button" className="kg-focus mt-4 bg-[var(--color-structure,#003A66)] px-5 py-3 font-bold text-white" onClick={() => setRetry(n => n + 1)}>Try again</button></div></div>;
  if (!book) return <div role="status" aria-live="polite" className="mx-auto max-w-3xl px-5 py-20 text-lg text-[var(--color-text-muted,#655f55)]">Loading God’s Promises for Hope…</div>;

  const sel = selectedId ? topicIndex.get(selectedId) : undefined;
  const sansStyle = { fontFamily: "var(--font-sans)" };
  const savedTopics = saved.map(id => topicIndex.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof topicIndex.get>>[];
  const cardLink = (id: string, title: string, sub?: string) => <li key={id}><button type="button" onClick={() => openTopic(id)} className="kg-focus w-full border-b border-[var(--color-border-soft,#d9cdb9)] py-3 text-left"><span className="block text-lg font-bold text-[var(--color-hero,#29474b)] underline underline-offset-2">{title}</span>{sub && <span className="block text-sm text-[var(--color-text-muted,#655f55)]" style={sansStyle}>{sub}</span>}</button></li>;

  let main;
  if (query.trim()) {
    main = <><p className={eyebrow} style={sansStyle}>Search</p><h2 className="mt-2 text-4xl text-[var(--color-hero,#29474b)]">Results for “{query.trim()}”</h2>
      <p role="status" className="mt-2 text-[var(--color-text-muted,#655f55)]" style={sansStyle}>{results.length} {results.length === 1 ? "topic" : "topics"} found across all 85 topics.</p>
      {results.length === 0 ? <div className="mt-8 border border-dashed border-[var(--color-border-control,#9a866d)] p-8 text-center text-lg">No promises match that search. Try a different word, a topic title, or a Scripture reference such as Isaiah 41:10.</div>
        : <ul className="mt-6 list-none p-0">{results.map(r => cardLink(r.topic.id, r.topic.title, `${r.group.title} · ${r.hit}`))}</ul>}</>;
  } else if (view === "topic" && sel) {
    const isSaved = saved.includes(sel.topic.id);
    const refs = sel.topic.blocks.filter(b => b.kind === "passage" && b.reference).map(b => `${b.reference} (${b.translation})`).join("; ");
    const shown = sel.topic.blocks.filter(b => b.kind === "passage" && (translation === "all" || b.translation === translation));
    main = <><p className={eyebrow} style={sansStyle}>{sel.group.title}</p>
      <div className="mb-8 flex flex-col gap-4 border-b border-[var(--color-border-soft,#d9cdb9)] pb-6 sm:flex-row sm:justify-between">
        <h2 className="text-4xl text-[var(--color-hero,#29474b)] md:text-5xl">{sel.topic.title}</h2>
        <div className="kg-no-print flex shrink-0 flex-wrap items-start gap-x-5" style={sansStyle}>
          <button type="button" aria-pressed={isSaved} onClick={() => toggleSave(sel.topic.id)} className={`${act} ${isSaved ? "text-[var(--color-action-warm,#C45100)]" : ""}`}>{isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{isSaved ? "Saved" : "Save study"}</button>
          <button type="button" onClick={() => copy(`${sel.topic.title}\n${refs}`, "References")} className={act}><Copy size={16} />Copy refs</button>
          <button type="button" onClick={() => copy(`${sel.topic.title}\n\n${blockText(shown)}`, "Passages")} className={act}><Copy size={16} />Copy passages</button>
        </div></div>
      <PromiseBlocks blocks={sel.topic.blocks} translation={translation} />
      {shown.length === 0 && <p className="mt-6 border border-dashed border-[var(--color-border-control,#9a866d)] p-6 text-center">No {translation} passages in this topic. Choose All to see every passage.</p>}
      <div className="mt-10 border-t border-[var(--color-border-soft,#d9cdb9)] pt-4 text-sm text-[var(--color-text-muted,#655f55)]" style={sansStyle}>Source: God’s Promises for a New Year, JesusOnline Ministries, © 2024. Quotations retain the translations printed in the source; see About, source and resources for full copyright notices.</div></>;
  } else if (view === "intro") {
    main = <><p className={eyebrow} style={sansStyle}>Introduction</p><div className="mt-4"><PromiseBlocks blocks={book.introduction} translation={translation} level={2} /></div></>;
  } else if (view === "source") {
    main = <><p className={eyebrow} style={sansStyle}>About this book</p><h2 className="mt-2 text-4xl text-[var(--color-hero,#29474b)]">Source, copyright and resources</h2>
      <p className="mt-4 text-lg leading-[1.75]">The original supplied title reads “{book.sourceTitle.replace(/\n/g, " — ")}”. Follow presents it here as God’s Promises for Hope; the content is unchanged.</p>
      <div className="kg-no-print mt-5 flex flex-wrap gap-3" style={sansStyle}>
        <a href={base("/promises/gods-promises-for-hope.pdf")} download className="kg-focus inline-flex items-center gap-2 bg-[var(--color-structure,#003A66)] px-4 py-2.5 font-bold text-white"><Download size={16} />Download PDF</a>
        <a href={base("/promises/gods-promises-for-hope.docx")} download className="kg-focus inline-flex items-center gap-2 border border-[var(--color-border-control,#9a866d)] px-4 py-2.5 font-bold"><Download size={16} />Download DOCX</a></div>
      <h3 className="mt-10 text-2xl">Publication and copyright</h3><div className="mt-3"><PromiseBlocks blocks={book.publication} /></div>
      <h3 className="mt-10 text-2xl">Resources</h3><div className="mt-3"><PromiseBlocks blocks={book.resources} /></div></>;
  } else if (view === "saved") {
    main = <><p className={eyebrow} style={sansStyle}>Saved on this browser</p><h2 className="mt-2 text-4xl text-[var(--color-hero,#29474b)]">Saved study</h2>
      {savedTopics.length === 0 ? <div className="mt-8 border border-dashed border-[var(--color-border-control,#9a866d)] p-8 text-center text-lg">Nothing saved yet. Open any topic and choose Save study to keep it here.</div>
        : <ul className="mt-6 list-none p-0">{savedTopics.map(s => cardLink(s.topic.id, s.topic.title, s.group.title))}</ul>}</>;
  } else {
    main = <div className="kg-book-intro"><p className={eyebrow} style={sansStyle}>Overview</p><h2 className="mt-2 text-4xl text-[var(--color-hero,#29474b)] md:text-5xl">{book.title}</h2>
      <p className="mt-4 text-lg text-[var(--color-text-muted,#655f55)]">Scripture for real life: {book.counts.topics} topics and {book.counts.passages} passages in {book.counts.groups} groups. Published by JesusOnline Ministries.</p>
      <div className="mt-8 space-y-8">{book.groups.map(g => <section key={g.id}>
        <h3 className="text-2xl text-[var(--color-hero,#29474b)]">{g.title}</h3>
        <p className="mt-1 text-lg leading-[1.75]">{g.description}</p>
        <div className="mt-3"><PromiseBlocks blocks={g.preamble} translation={translation} /></div>
        <ul className="mt-3 list-none p-0">{g.topics.map(t => cardLink(t.id, t.title))}</ul></section>)}</div></div>;
  }

  return <div className="promises-reader flex flex-1 flex-col text-[var(--color-text,#394b4b)]" style={{ background: "var(--color-surface,#fffaf2)" }}>
    <style>{`.promises-reader h2{font-family:var(--font-display)}.promises-reader .kg-focus:focus-visible{outline:3px solid var(--color-focus,#0095FF);outline-offset:2px}.promises-reader .kg-scroll::-webkit-scrollbar{width:6px}.promises-reader .kg-scroll::-webkit-scrollbar-thumb{background:var(--color-border-control,#9a866d);border-radius:8px}@media print{.promises-reader .kg-no-print{display:none!important}.promises-reader .kg-shell{display:block!important}.promises-reader .kg-reading{max-width:none!important}}`}</style>
    <div className="kg-no-print border-b border-[var(--color-border-soft,#d9cdb9)] bg-[var(--color-surface-soft,#f3ede2)] px-5 py-3 md:hidden">
      <button type="button" aria-expanded={menu} aria-controls="promises-sidebar" onClick={() => setMenu(v => !v)} className="kg-focus flex items-center gap-2 text-base font-bold text-[var(--color-hero,#29474b)]" style={sansStyle}><Menu size={18} />Groups &amp; search</button></div>
    <div className="kg-shell mx-auto grid w-full max-w-[1300px] flex-1 grid-cols-1 md:grid-cols-[300px_1fr]">
      <aside id="promises-sidebar" aria-label="Promises sidebar" className={`${menu ? "block" : "hidden"} kg-no-print border-r border-[var(--color-border-soft,#d9cdb9)] bg-[var(--color-surface-soft,#f3ede2)] md:block`}>
        <div className="kg-scroll overflow-y-auto md:sticky md:top-[calc(var(--kg-header-height,95px)+0px)] md:max-h-[calc(100dvh-var(--kg-header-height,95px))]">
          <PromisesSidebar book={book} view={view} selectedId={selectedId} expanded={expanded} query={query} savedCount={saved.length} translation={translation}
            onTranslation={setTranslation} onQuery={setQuery} onView={openView} onTopic={openTopic} onToggleGroup={id => setExpanded(e => e === id ? "" : id)} />
        </div></aside>
      <section ref={reading} tabIndex={-1} aria-label="Promises reading" className="kg-reading min-w-0 max-w-[920px] px-5 py-8 outline-none md:px-10 md:py-12 lg:px-14">
        <div aria-live="polite" className="kg-no-print">
          {status && <p role={status.ok ? "status" : "alert"} className={`mb-4 text-base font-bold ${status.ok ? "text-[var(--color-hero,#29474b)]" : "text-[var(--color-action-warm,#C45100)]"}`} style={sansStyle}>{status.msg}</p>}
          {storageError && <p role="alert" className="mb-4 flex items-start gap-2 text-base text-[var(--color-action-warm,#C45100)]" style={sansStyle}><AlertCircle size={18} className="mt-0.5 shrink-0" />{storageError}</p>}
        </div>
        {main}
      </section>
    </div></div>;
}
