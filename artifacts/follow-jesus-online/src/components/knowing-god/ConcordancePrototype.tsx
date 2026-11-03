import { TopicCrossReferences } from "./TopicCrossReferences";
import { TopicSearchResults } from "./TopicSearchResults";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Bookmark, BookmarkCheck, Check, ChevronDown, ChevronRight, ChevronsLeft, Copy, Printer, Search, SlidersHorizontal, X } from "lucide-react";
import { fetchNetPassages, netCache, netNotes } from "./bible-api";
import { formatSourcePassage } from "./passage-format";
import { topicTitleSearchRank } from "./topic-search";
import { knowingGodScriptureHref } from "./scripture-link";
import { pushTopicHash, subscribeToTopicHistory, topicIdFromHash } from "./topic-history.mjs";
import { buildDevotionalHierarchy, countSubstantive, isSubstantive, searchScripturePassages, uniqueDevotionalCount, uniqueSeeAlsoTargets } from "./knowing-god-ui";

type Passage = { reference: string; text: string };

type RelatedTopic = { sourceLabel: string; targetIds: string[] };
type TopicIndex = { id: string; title: string; letter: string; sourcePages: number[]; recordType: string; passageCount: number; payload: string };
type Topic = TopicIndex & { passages: Passage[]; definition: string; additionalScripture: AdditionalScriptureSection[]; seeAlso: RelatedTopic[]; sourceMarkers: string[] };
type Index = { counts: { topicCount: number; passageCount: number }; letterDistribution: Record<string, number>; topics: TopicIndex[] };
const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const ntBooks = ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];
const books = ["All books", "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", ...ntBooks];
const base = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`;
const testamentFor = (ref: string) => ntBooks.some(book => ref.startsWith(book)) ? "New Testament" : "Old Testament";
const normalized = (value: string) => value.trim().toLocaleLowerCase();
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Publisher attribution (required by the source), the only off-site link here. */
const publisherStoryUrl = "https://www.zmission.org/our-story.html";
const scriptureHref = (reference: string) => knowingGodScriptureHref(reference, import.meta.env.BASE_URL);
export function ConcordancePrototype() {
  const [index, setIndex] = useState<Index | null>(null);
  const [indexError, setIndexError] = useState("");
  const [payloads, setPayloads] = useState<Record<string, Topic[]>>({});
  const [payloadError, setPayloadError] = useState<Record<string, string>>({});
  const loading = useRef(new Map<string, Promise<Topic[]>>());
  const [selectedId, setSelectedId] = useState("abiding");
  const [view, setView] = useState<"start" | "topic">("start");
  const [mode, setMode] = useState<"all" | "devotional">("all");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState(""); const [testament, setTestament] = useState("All Testaments"); const [book, setBook] = useState("All books");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const mobileSearchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const studyHeading = useRef<HTMLHeadingElement>(null);
  const isFiltering = Boolean(query.trim());
  const [searchRetry, setSearchRetry] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    requestAnimationFrame(() => (isMobile() ? mobileSearchInput.current : searchToggle.current)?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    if (!searchOpen || isMobile()) return;
    searchInput.current?.focus({ preventScroll: true });
  }, [searchOpen]);
  const readerShell = useRef<HTMLDivElement>(null);
  const [study, setStudy] = useState<string[]>([]); const [studyLoaded, setStudyLoaded] = useState(false); const [copied, setCopied] = useState(""); const [copyError, setCopyError] = useState("");
  const [translation, setTranslation] = useState<"NET" | "KJV">("NET"); const [translationLoaded, setTranslationLoaded] = useState(false);
  const [netLoading, setNetLoading] = useState(false); const [netError, setNetError] = useState(false); const [, setNetTick] = useState(0);
  const [netRetry, setNetRetry] = useState(0);
  const [expandedLetter, setExpandedLetter] = useState("A");
  const browseLetter = (letter: string) => {
    setSearchOpen(false);
    setQuery("");
    if (!query.trim() && expandedLetter === letter) { setExpandedLetter(""); return; }
    setExpandedLetter(letter);
    loadLetter(letter).catch(() => undefined);
  };
  useEffect(() => {
    document.documentElement.dataset.knowingGodView = isFiltering || searchOpen ? "search" : view;
    return () => { delete document.documentElement.dataset.knowingGodView; };
  }, [view, isFiltering, searchOpen]);

  const loadLetter = (letter: string) => {
    if (payloads[letter]) return Promise.resolve(payloads[letter]);
    const active = loading.current.get(letter); if (active) return active;
    const request = fetch(base(`/knowing-god/data/topics-${letter.toLowerCase()}.json`)).then(async res => {
      if (!res.ok) throw new Error(`Unable to load ${letter} topics (${res.status}).`);
      return (await res.json() as { topics: Topic[] }).topics.map(topic => ({
        ...topic,
        passages: topic.passages.map(passage => ({ ...passage, text: formatSourcePassage(passage.reference, passage.text) })),
      }));
    }).then(topics => { setPayloads(previous => ({ ...previous, [letter]: topics })); setPayloadError(previous => ({ ...previous, [letter]: "" })); return topics; })
      .catch(error => { const message = error instanceof Error ? error.message : `Unable to load ${letter} topics.`; setPayloadError(previous => ({ ...previous, [letter]: message })); throw error; })
      .finally(() => loading.current.delete(letter));
    loading.current.set(letter, request); return request;
  };
  const applyTopic = (item: TopicIndex) => {
    setSearchOpen(false);
    setQuery("");
    setSelectedId(item.id); setExpandedLetter(item.letter); setView("topic");
    loadLetter(item.letter).catch(() => undefined);
  };
  const openTopic = (item: TopicIndex) => {
    setSearchOpen(false);
    setQuery("");
    if (selectedId === item.id && view === "topic") return;
    applyTopic(item);
    pushTopicHash(window, item.id);
  };
  const openStart = () => {
    setSearchOpen(false);
    setQuery("");
    setView("start");
    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    fetch(base("/knowing-god/data/index.json")).then(async res => {
      if (!res.ok) throw new Error(`Unable to load topical index (${res.status}).`);
      return res.json() as Promise<Index>;
    }).then(data => {
      setIndex(data);
      const hashId = topicIdFromHash(window.location.hash);
      const initial = data.topics.find(topic => topic.id === hashId) || data.topics.find(topic => topic.id === "abiding") || data.topics[0];
      if (initial) {
        setSelectedId(initial.id);
        setExpandedLetter(initial.letter);
        if (initial.id === hashId) {
          setView("topic");
          loadLetter(initial.letter).catch(() => undefined);
        }
      }
    }).catch(error => setIndexError(error instanceof Error ? error.message : "Unable to load the topical index."));
    try { setStudy(JSON.parse(localStorage.getItem("knowing-god-study") || "[]")); } catch { setStudy([]); } finally { setStudyLoaded(true); }
    const stored = localStorage.getItem("knowing-god-translation"); if (stored === "NET" || stored === "KJV") setTranslation(stored); setTranslationLoaded(true);
  }, []);
  useEffect(() => {
    if (!index) return;
    const restoreTopicFromHash = () => {
      const hashId = topicIdFromHash(window.location.hash);
      const target = hashId ? index.topics.find(topic => topic.id === hashId) : undefined;
      if (target) applyTopic(target);
      else { setQuery(""); setView("start"); }
    };
    return subscribeToTopicHistory(window, restoreTopicFromHash);
  }, [index, payloads]);
  useEffect(() => { if (studyLoaded) localStorage.setItem("knowing-god-study", JSON.stringify(study)); }, [study, studyLoaded]);
  useEffect(() => {
    if (!savedNotice) return;
    const timer = window.setTimeout(() => setSavedNotice(false), 8000);
    return () => window.clearTimeout(timer);
  }, [savedNotice]);

  const selectedIndex = index?.topics.find(topic => topic.id === selectedId);
  const selected = selectedIndex ? payloads[selectedIndex.letter]?.find(topic => topic.id === selectedId) : undefined;
  const scopedTopics = useMemo(() => index?.topics || [], [index]);
  const substantiveTotal = useMemo(() => countSubstantive(scopedTopics), [scopedTopics]);
  const devotionalGroups = useMemo(() => buildDevotionalHierarchy(scopedTopics), [scopedTopics]);
  const devotionalTotal = useMemo(() => uniqueDevotionalCount(devotionalGroups), [devotionalGroups]);
  const searchLetters = useMemo(() => [...new Set(scopedTopics.map(item => item.letter))], [scopedTopics]);
  useEffect(() => {
    if (!isFiltering) return;
    let active = true;
    const letters = searchLetters.filter(letter => !payloads[letter])[Symbol.iterator]();
    const worker = async () => {
      while (active) {
        const next = letters.next();
        if (next.done) return;
        await loadLetter(next.value).catch(() => undefined);
      }
    };
    void Promise.all(Array.from({ length: 3 }, worker));
    return () => { active = false; };
  }, [searchLetters, isFiltering, searchRetry]);
  const searchingContent = isFiltering && searchLetters.some(letter => !payloads[letter] && !payloadError[letter]);
  const searchContentError = isFiltering && searchLetters.some(letter => !payloads[letter] && payloadError[letter]);
  const retrySearch = () => {
    setPayloadError(previous => {
      const next = { ...previous };
      searchLetters.forEach(letter => { if (!payloads[letter]) next[letter] = ""; });
      return next;
    });
    setSearchRetry(value => value + 1);
  };
  const topicMatches = useMemo(() => {
    if (!query.trim()) return [];
    return scopedTopics
      .map(item => ({ item, rank: topicTitleSearchRank(item.title, query) }))
      .filter(entry => entry.rank < 4)
      .sort((a, b) => a.rank - b.rank || a.item.title.localeCompare(b.item.title))
      .map(entry => entry.item);
  }, [scopedTopics, query]);
  const scriptureMatches = useMemo(() => {
    if (!query.trim()) return [];
    const loaded = alphabet.flatMap(letter => payloads[letter] || []);
    return searchScripturePassages(loaded, query);
  }, [payloads, query]);
  const letterTopics = scopedTopics.filter(item => item.letter === expandedLetter);
  const shownCount = isFiltering ? countSubstantive(topicMatches) : countSubstantive(letterTopics);
  const visiblePassages = selected?.passages.filter(p => (testament === "All Testaments" || testamentFor(p.reference) === testament) && (book === "All books" || p.reference.startsWith(book))) || [];
  useEffect(() => {
    if (searchOpen || isFiltering || view !== "topic" || !selected) return;
    const reading = readerShell.current?.querySelector<HTMLElement>(".kg-reading");
    if (!reading || !isMobile()) return;
    reading.tabIndex = -1;
    reading.setAttribute("aria-label", `${selected.title} topic study`);
    reading.focus({ preventScroll: true });
    const headerHeight = document.querySelector("[data-site-header]")?.getBoundingClientRect().height ?? 0;
    window.scrollTo({ top: Math.max(0, window.scrollY + reading.getBoundingClientRect().top - headerHeight - 8), behavior: "instant" });
  }, [view, selectedId, selected, isFiltering, searchOpen]);
  useEffect(() => {
    if (isFiltering || view !== "topic" || !translationLoaded || translation !== "NET" || !selected) return;
    const controller = new AbortController();
    let current = true; const missing = visiblePassages.map(p => p.reference).filter(ref => !netCache.has(ref));
    if (!missing.length) { setNetLoading(false); setNetError(false); return; }
    setNetLoading(true); setNetError(false); fetchNetPassages(missing, 3, controller.signal).then(ok => { if (current) { setNetLoading(false); setNetError(!ok); setNetTick(x => x + 1); } });
    return () => { current = false; controller.abort(); };
  }, [view, selectedId, selected, translation, translationLoaded, testament, book, visiblePassages.length, netRetry, isFiltering]);
  const copy = async (what: "topic" | "passages") => {
    if (!selected) return;
    const text = what === "topic" ? `${selected.title}\n${selected.passages.map(p => p.reference).join("; ")}` : visiblePassages.map(p => {
      const useNet = translation === "NET" && netCache.has(p.reference);
      const note = useNet ? netNotes.get(p.reference) : undefined;
      return `${p.reference} (${useNet ? "NET" : "KJV"})\n${useNet ? netCache.get(p.reference) : p.text}${note ? `\nTranslation note: ${note}` : ""}`;
    }).join("\n\n");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
    } catch {
      setCopied("");
      setCopyError("Copy failed. Your browser blocked clipboard access; please select the text and copy it manually.");
      window.setTimeout(() => setCopyError(""), 4000);
      return;
    }
    setCopyError(""); setCopied(what); window.setTimeout(() => setCopied(""), 1600);
  };
  const toggleStudy = (id: string) => setStudy(list => list.includes(id) ? list.filter(value => value !== id) : [...list, id]);
  const saveFromToolbar = (id: string) => {
    const saving = !study.includes(id);
    toggleStudy(id);
    setSavedNotice(saving);
  };
  const viewSaved = () => {
    setSavedNotice(false);
    const heading = studyHeading.current;
    if (!heading) return;
    heading.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    heading.focus({ preventScroll: true });
  };
  const topicById = (id: string) => index?.topics.find(t => t.id === id);
  const followCrossReference = (id: string) => {
    setQuery("");
    setTestament("All Testaments");
    setBook("All books");
    if (id === "*") { openStart(); return; }
    const target = topicById(id);
    if (target) openTopic(target);
  };
  const toggleGroup = (key: string) => setOpenGroups(previous => {
    const next = new Set(previous);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const muted = "text-[var(--color-text-muted,#2E5A7A)]";
  const pill = (active: boolean) => `kg-focus kg-sans whitespace-nowrap rounded font-bold ${active ? "bg-[var(--color-selected-warm,#FFEADB)] text-[var(--color-text,#003A66)] shadow-[inset_0_0_0_1px_var(--color-action-warm,#C45100)]" : "text-[var(--color-text-muted,#2E5A7A)] hover:bg-[var(--color-surface-soft,#E6F5FF)]"}`;
  const topicButton = (active: boolean) => `kg-focus flex min-h-11 w-full items-center justify-between gap-3 border-l-4 px-3 py-2 text-left text-base ${active ? "border-[var(--color-action-warm,#C45100)] bg-[var(--color-selected-warm,#FFEADB)] text-[var(--color-text,#003A66)]" : "border-transparent text-[var(--color-text,#003A66)] hover:bg-[var(--color-surface,#FFFDFB)]"}`;
  const toolbarButton = "kg-focus kg-sans inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded px-1 text-xs font-bold text-[var(--color-text,#003A66)] hover:bg-[var(--color-surface-soft,#E6F5FF)] sm:px-2 sm:text-sm";
  const showMobileSidebar = view === "start" || isFiltering || searchOpen;
  const searching = searchOpen || isFiltering;
  const isSaved = selected ? study.includes(selected.id) : false;

  const mobileSearch = <div className="kg-no-print mt-3 md:hidden">
    <label htmlFor="topic-search-mobile" className="sr-only">Search Knowing God topics and KJV Scripture</label>
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} size={16} aria-hidden="true" />
      <input ref={mobileSearchInput} id="topic-search-mobile" data-testid="input-topic-search-mobile" type="search" value={query} onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); closeSearch(); } }} placeholder="Search topics and Scripture"
        className="kg-focus h-11 w-full rounded border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] pl-9 pr-11 text-base text-[var(--color-text,#003A66)]" />
      {query && <button type="button" onClick={closeSearch} aria-label="Clear search" data-testid="button-clear-topic-search-mobile"
        className="kg-focus absolute right-0 top-0 flex h-11 w-11 items-center justify-center"><X size={18} aria-hidden="true" /></button>}
    </div>
  </div>;
  const desktopSearchToggle = (className: string) => <button ref={searchToggle} type="button" onClick={() => setSearchOpen(true)} aria-label="Search Knowing God" title="Search"
    aria-expanded={searching} aria-controls="topic-search-results" data-testid="button-open-topic-search"
    className={`kg-focus hidden items-center justify-center rounded border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] md:flex ${className}`}><Search size={14} aria-hidden="true" /></button>;

  return <div className="flex flex-col min-h-[100dvh] text-[var(--color-text,#003A66)]" style={{ background: "var(--color-surface, #FFFDFB)", fontFamily: "var(--font-sans, 'Source Sans 3', system-ui, sans-serif)" }}>
    <style>{`.kg-sans{font-family:var(--font-sans, 'Source Sans 3', system-ui, sans-serif)}.kg-focus:focus-visible{outline:3px solid var(--color-focus,#0095FF);outline-offset:2px}.kg-scroll::-webkit-scrollbar{width:6px}.kg-scroll::-webkit-scrollbar-thumb{background:var(--color-border-control,#5B9BC4);border-radius:8px}@media print{.kg-no-print,[data-site-header],header,nav,footer{display:none!important}.kg-reading{max-width:none!important;padding:0!important}.kg-shell{display:block!important}}@media (prefers-reduced-motion: reduce){.kg-toast{transition:none!important}}`}</style>
    <div className="kg-warm-theme flex-1 flex flex-col bg-[var(--color-surface,#FFFDFB)]">
      <div ref={readerShell} className="kg-shell flex-1 mx-auto w-full max-w-[1500px] grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_265px]">
      <aside data-testid="knowing-god-sidebar" className={`${showMobileSidebar ? "block" : "hidden"} order-2 kg-no-print border-[var(--color-border-soft,#CCEBFF)] bg-[var(--color-surface-soft,#E6F5FF)] md:order-none md:block md:border-r`}><div className="flex flex-col p-4 md:sticky md:top-[var(--kg-header-height,95px)] md:max-h-[calc(100dvh-var(--kg-header-height,95px))] md:min-h-[calc(100dvh-var(--kg-header-height,95px))] md:overflow-y-auto kg-scroll md:p-5">
        <h2 data-testid="heading-knowing-god-sidebar" className="-mx-5 -mt-5 mb-4 hidden border-b border-[var(--color-border-soft,#d9cdb9)] bg-[var(--color-surface-soft,#f3ede2)] px-5 py-3 text-2xl font-bold text-[var(--color-hero,#29474b)] md:block">
          <a href={base("/knowing-god")} onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); openStart(); }} className="kg-focus" data-testid="link-knowing-god-home">Knowing God</a>
        </h2>
        <p id="kg-translation-label" className="kg-sans mb-1 text-xs font-bold uppercase tracking-[.2em] text-[var(--color-action-warm,#C45100)]">Translation</p>
        <div role="group" aria-labelledby="kg-translation-label" className="mb-4 flex rounded border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] p-1">{(["NET", "KJV"] as const).map(value => <button key={value} data-testid={`button-translation-${value}`} onClick={() => { setTranslation(value); localStorage.setItem("knowing-god-translation", value); }} aria-pressed={translation === value} className={`${pill(translation === value)} min-h-10 flex-1 px-2 text-sm`}>{value} Bible</button>)}</div>
        <div role="group" aria-label="Topic selection" className="mb-3 grid grid-cols-[.8fr_1.2fr] gap-1 rounded border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] p-1">
          <button type="button" data-testid="button-mode-all" aria-pressed={mode === "all"} onClick={() => setMode("all")} className={`${pill(mode === "all")} min-h-10 px-1.5 text-[13px]`}>All topics <span className={`font-normal ${muted}`}>— {substantiveTotal || 649}</span></button>
          <button type="button" data-testid="button-mode-devotional" aria-pressed={mode === "devotional"} onClick={() => setMode("devotional")} className={`${pill(mode === "devotional")} min-h-10 px-1.5 text-[13px]`}>Devotional Topics <span className={`font-normal ${muted}`}>— {devotionalTotal || 502}</span></button>
        </div>
        <button onClick={() => setFilterOpen(v => !v)} aria-expanded={filterOpen} data-testid="button-passage-filters" className="kg-focus kg-sans mb-2 flex min-h-11 w-full items-center justify-between border-y border-[var(--color-border-soft,#CCEBFF)] text-left text-xs font-semibold uppercase tracking-widest text-[var(--color-text,#003A66)]"><span className="flex gap-2"><SlidersHorizontal size={14}/>Passage filters</span><ChevronDown size={14} className={filterOpen ? "rotate-180" : ""}/></button>
        {filterOpen && <div className="kg-sans mb-3 space-y-3 border-b border-[var(--color-border-soft,#CCEBFF)] pb-3"><label className="block text-sm font-semibold">Testament<select value={testament} onChange={e => setTestament(e.target.value)} className="mt-1 w-full border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] p-2 text-base"><option>All Testaments</option><option>Old Testament</option><option>New Testament</option></select></label><label className="block text-sm font-semibold">Bible book<select value={book} onChange={e => setBook(e.target.value)} className="mt-1 w-full border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] p-2 text-base">{books.map(value => <option key={value}>{value}</option>)}</select></label></div>}
        {indexError && <div role="alert" className="kg-sans py-4 text-base text-[var(--color-action-warm,#C45100)]">{indexError}</div>}{!index && !indexError && <div role="status" className={`kg-sans space-y-2 py-3 ${muted}`}><span className="sr-only">Loading complete topical index…</span>{[0, 1, 2].map(i => <div key={i} className="h-7 animate-pulse rounded bg-[var(--color-surface,#FFFDFB)]" />)}</div>}
        {index && mode === "all" && <nav aria-label="Topical Bible topics A to Z">
          <div className="mb-2 flex items-baseline justify-between"><h2 className="kg-sans text-xs font-bold uppercase tracking-[.2em] text-[var(--color-action-warm,#C45100)]">A–Z index</h2><span className={`kg-sans text-xs ${muted}`} data-testid="text-topics-shown">{shownCount} of {substantiveTotal} shown</span></div>
          <div className="grid grid-cols-9 gap-1">{alphabet.map(letter => { const has = scopedTopics.some(topic => topic.letter === letter); const active = !isFiltering && expandedLetter === letter; return <button key={letter} disabled={!has} onClick={() => browseLetter(letter)} aria-label={`Browse ${letter} topics`} aria-expanded={active} aria-controls="topic-letter-results" data-testid={`button-letter-${letter}`} className={`kg-focus kg-sans h-9 min-w-0 rounded text-sm font-bold md:h-8 md:text-xs ${!has ? "cursor-not-allowed border border-transparent text-[var(--color-border-control,#5B9BC4)]" : active ? "bg-[var(--color-selected-warm,#FFEADB)] text-[var(--color-text,#003A66)] shadow-[inset_0_0_0_1px_var(--color-action-warm,#C45100)]" : "border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] text-[var(--color-text,#003A66)]"}`}>{letter}</button>; })}{desktopSearchToggle("h-8")}</div>
          {mobileSearch}
          <div id="topic-letter-results" data-topic-results className="mt-3">
            {(!isFiltering ? letterTopics : []).map(item => <button key={item.id} aria-pressed={selectedId === item.id && view === "topic"} data-testid={`button-topic-${item.id}`} onClick={() => openTopic(item)} className={topicButton(selectedId === item.id && view === "topic")}><span className={isSubstantive(item) ? "" : "italic"}>{item.title}</span><span className={`kg-sans text-xs ${muted}`}>{isSubstantive(item) ? item.passageCount : "see"}</span></button>)}
          </div>
        </nav>}
        {index && mode === "devotional" && <nav aria-label="Devotional topics">
          <div className="mb-2 flex items-center justify-between gap-2"><h2 className="kg-sans text-xs font-bold uppercase tracking-[.2em] text-[var(--color-action-warm,#C45100)]">Devotional Guide</h2>{desktopSearchToggle("h-9 w-9")}</div>
          {mobileSearch}
          {!isFiltering && <ul className="mt-3">{devotionalGroups.map(group => { const open = openGroups.has(group.key); return <li key={group.key}>
            <button type="button" onClick={() => toggleGroup(group.key)} aria-expanded={open} aria-controls={`devotional-${group.key}`} data-testid={`button-devotional-group-${group.key}`} className="kg-focus kg-sans flex min-h-11 w-full items-center gap-2 border-b border-[var(--color-border-soft,#CCEBFF)] text-left text-sm font-bold uppercase tracking-wide text-[var(--color-hero,#006BB3)]">
              {open ? <ChevronDown size={16} aria-hidden="true"/> : <ChevronRight size={16} aria-hidden="true"/>}{group.heading}<span className={`ml-auto text-xs font-normal normal-case ${muted}`}>{group.children.length}</span></button>
            {open && <ul id={`devotional-${group.key}`} className="mb-2 ml-4 border-l border-[var(--color-border-soft,#CCEBFF)]">{group.children.map(child => { const target = child.topicId ? topicById(child.topicId) : undefined; const active = !!target && selectedId === target.id && view === "topic"; return <li key={child.key}>
              {target ? <button type="button" aria-pressed={active} onClick={() => openTopic(target)} data-testid={`button-devotional-topic-${child.key}`} className={topicButton(active)}><span>{target.title}</span><span className={`kg-sans text-xs ${muted}`}>{target.passageCount}</span></button>
                : <span className={`block px-3 py-2 text-base ${muted}`}>{child.label}</span>}
            </li>; })}</ul>}
          </li>; })}</ul>}
        </nav>}
      </div></aside>
      {searching ? <TopicSearchResults query={query} topics={topicMatches} scripture={scriptureMatches} topicTitle={id => topicById(id)?.title} loading={!index && !indexError} error={indexError} searchingContent={searchingContent} contentError={searchContentError} onRetry={retrySearch} onClear={() => { setQuery(""); searchInput.current?.focus(); }} onSelect={id => { const target = topicById(id); if (target) openTopic(target); }}
        searchControl={<div className="kg-no-print mb-5 hidden md:block">
          <label className="kg-sans mb-2 block text-sm font-bold" htmlFor="topic-search">Search topic titles and KJV Scripture text</label>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1"><Search className={`absolute left-3 top-3 ${muted}`} size={16} aria-hidden="true" /><input ref={searchInput} id="topic-search" data-testid="input-topic-search" type="search" aria-controls="topic-search-results" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); closeSearch(); } }} placeholder="Search topics and Scripture" className="kg-focus w-full border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] py-2.5 pl-9 pr-3 text-base text-[var(--color-text,#003A66)]" /></div>
            <button type="button" onClick={closeSearch} aria-label="Close search" title="Close search" data-testid="button-close-topic-search" className="kg-focus flex h-11 w-11 shrink-0 items-center justify-center rounded hover:bg-[var(--color-surface-soft,#E6F5FF)]"><X size={18} aria-hidden="true" /></button>
          </div>
        </div>} /> : view === "start" ? <section className="kg-reading kg-book-intro order-1 min-w-0 max-w-[920px] px-4 pb-4 pt-5 md:order-none md:px-10 md:py-10 lg:px-14">
        <h1 data-testid="heading-knowing-god" className="whitespace-nowrap text-[clamp(1.3rem,6.6vw,3rem)] font-bold leading-tight text-[var(--color-hero,#006BB3)]" style={{ fontFamily: "var(--font-display, 'Playfair Display', serif)" }}>Knowing God Topical Bible</h1>
        <p className="mt-2 text-base leading-relaxed text-[var(--color-text,#003A66)] md:text-lg" data-testid="text-knowing-god-summary">{substantiveTotal || 649} topics and {(index?.counts.passageCount ?? 13535).toLocaleString()} curated passages on the Nature and Character of the Almighty.</p>
        <div className="kg-sans mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <a href={publisherStoryUrl} target="_blank" rel="noopener noreferrer" data-testid="link-zinzendorf" className={`kg-focus inline-flex min-h-11 items-center underline underline-offset-2 ${muted}`}>© 2026 by Zinzendorf Mission</a>
          <a href={base("/knowing-god/introduction")} data-testid="link-introductory-articles" className="kg-focus inline-flex min-h-11 items-center gap-1 font-bold text-[var(--color-hero,#006BB3)] underline underline-offset-2 hover:text-[var(--color-structure,#003A66)]">See Introductory Articles <ChevronRight size={14} aria-hidden="true"/></a>
        </div>
        <p className={`kg-sans mt-4 hidden text-base md:block ${muted}`}>Choose a letter or a devotional heading at left, or search topic titles and KJV Scripture.</p>
      </section> :
      <section className="kg-reading order-1 min-w-0 max-w-[920px] px-4 py-4 md:order-none md:px-10 md:py-7 lg:px-14">{!selectedIndex ? <div role="status" className={`kg-sans py-16 text-center text-base ${muted}`}>Loading selected topic…</div> : !selected ? <div className={`kg-sans py-16 text-center text-base ${muted}`}>{payloadError[selectedIndex.letter] ? <div role="alert" className="text-[var(--color-action-warm,#C45100)]">{payloadError[selectedIndex.letter]} <button className="kg-focus min-h-11 underline" onClick={() => loadLetter(selectedIndex.letter).catch(() => undefined)}>Try again</button></div> : <div role="status" className="space-y-3"><span className="sr-only">Loading {selectedIndex.letter} topics…</span>{[0, 1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded bg-[var(--color-surface-soft,#E6F5FF)]" />)}</div>}</div> : <>
        <nav aria-label="Breadcrumb" className={`kg-no-print kg-sans flex items-center gap-1 text-sm ${muted}`}>
          <a href={base("/knowing-god")} onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); openStart(); }} aria-label="Back to Knowing God topic index" data-testid="link-topic-study-back" className="kg-focus inline-flex min-h-11 items-center gap-1 font-semibold text-[var(--color-hero,#006BB3)] underline underline-offset-2"><ChevronsLeft size={16} aria-hidden="true"/>Topic study</a>
          <ChevronRight size={14} aria-hidden="true"/><span className="truncate">{selected.title}</span>
        </nav>
        <div role="toolbar" aria-label="Topic actions" className="kg-no-print -ml-1.5 flex flex-nowrap items-center gap-0 sm:gap-1">
          <button type="button" onClick={() => saveFromToolbar(selected.id)} aria-pressed={isSaved} data-testid="button-save-topic" className={`${toolbarButton} ${isSaved ? "text-[var(--color-action-warm,#C45100)]" : ""}`}>{isSaved ? <BookmarkCheck size={14} aria-hidden="true"/> : <Bookmark size={14} aria-hidden="true"/>}{isSaved ? <>Saved<Check size={13} aria-hidden="true"/></> : "Save"}</button>
          <span aria-hidden="true" className={muted}>·</span>
          <button type="button" onClick={() => copy("topic")} data-testid="button-copy-refs" className={toolbarButton}><Copy size={14} aria-hidden="true"/>{copied === "topic" ? "Copied" : "Copy refs"}</button>
          <span aria-hidden="true" className={muted}>·</span>
          <button type="button" onClick={() => copy("passages")} disabled={!visiblePassages.length} data-testid="button-copy-verses" className={`${toolbarButton} disabled:opacity-50`}><Copy size={14} aria-hidden="true"/>{copied === "passages" ? "Copied" : "Copy verses"}</button>
          <span aria-hidden="true" className={muted}>·</span>
          <button type="button" onClick={() => window.print()} data-testid="button-print-topic" className={toolbarButton}><Printer size={14} aria-hidden="true"/>Print</button>
        </div>
        <div className="mb-3 border-b border-[var(--color-border-soft,#CCEBFF)] pb-3">
          <h2 className="text-3xl leading-tight text-[var(--color-hero,#006BB3)] md:text-5xl" style={{fontFamily: "var(--font-display, 'Playfair Display', serif)"}} data-testid="heading-topic-title">{selected.title} <span className={`kg-sans align-middle text-sm font-normal ${muted}`} data-testid="text-topic-result-count">{selected.recordType === "cross-reference" ? "cross-reference" : `${visiblePassages.length} ${visiblePassages.length === 1 ? "result" : "results"}`}</span></h2>
          {selected.definition && <p className={`mt-1 text-lg italic ${muted}`}>{selected.definition}</p>}
        </div>
        {selected.passages.length > 0 && translation === "NET" && netError && <div role="alert" className="kg-no-print mb-3 flex flex-wrap items-center gap-2 text-base text-[var(--color-action-warm,#C45100)]"><AlertCircle size={18}/>Some NET passages could not be loaded from this site. Those passages are labeled KJV below. <button type="button" className="kg-focus min-h-11 font-bold underline" onClick={() => setNetRetry(value => value + 1)}>Try again</button></div>}
        {selected.passages.length > 0 ? <>{netLoading && translation === "NET" ? <div role="status" className="space-y-3 py-2"><span className="sr-only">Loading NET Bible text…</span>{[0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded bg-[var(--color-surface-soft,#E6F5FF)]" />)}</div> : <div>{visiblePassages.map((p, i) => {
          const net = netCache.get(p.reference);
          return <article key={`${p.reference}-${i}`} className="border-b border-[var(--color-border-soft,#CCEBFF)] py-4">
            <p className="kg-sans text-base font-bold text-[var(--color-hero,#006BB3)]">
              <a href={scriptureHref(p.reference)} target="_blank" rel="noopener noreferrer" className="kg-focus underline underline-offset-2 hover:text-[var(--color-structure,#003A66)]">{p.reference}<span className="sr-only"> (opens Bible in a new tab)</span></a> <span className={`ml-2 text-xs font-normal ${muted}`}>
                {translation === "KJV" ? "KJV" : netCache.has(p.reference) ? "NET" : "Fallback KJV"}
              </span>
            </p>
            <p className="mt-1.5 whitespace-pre-line text-lg leading-[1.7] text-[var(--color-text,#003A66)]">{translation === "NET" ? net ?? formatSourcePassage(p.reference, p.text) : formatSourcePassage(p.reference, p.text)}</p>
            {translation === "NET" && netCache.has(p.reference) && netNotes.has(p.reference) && <p className={`kg-sans mt-2 border-l-2 border-[var(--color-border-soft,#CCEBFF)] pl-3 text-sm leading-relaxed ${muted}`}><strong>Translation note:</strong> {netNotes.get(p.reference)}</p>}
          </article>;
        })}</div>}{visiblePassages.length === 0 && <div className={`border border-dashed border-[var(--color-border-control,#5B9BC4)] py-10 text-center text-base ${muted}`}>No passages match the current filters.</div>}</> : <TopicCrossReferences onNavigate={followCrossReference} related={selected.seeAlso} topics={index?.topics || []} />}{selected.additionalScripture.length > 0 && <div className="mt-8 border-t border-[var(--color-border-soft,#CCEBFF)] pt-5"><p className={`kg-sans text-xs font-bold uppercase ${muted}`}>Additional Scripture</p>{selected.additionalScripture.map((section, sectionIndex) => <p className="mt-2 text-base text-[var(--color-text,#003A66)]" key={`${selected.id}-additional-${sectionIndex}`}>{section.links.map((reference, index, all) => { const unchanged = reference.queries.length === 1 && normalized(reference.sourceLabel.replace(/\.$/, "")) === normalized(reference.queries[0]); return <span key={`${reference.sourceLabel}-${index}`}>{unchanged ? <a className="kg-focus text-[var(--color-hero,#006BB3)] underline hover:text-[var(--color-structure,#003A66)]" href={scriptureHref(reference.queries[0])} target="_blank" rel="noopener noreferrer">{reference.sourceLabel}<span className="sr-only"> (opens Bible in a new tab)</span></a> : <span>{reference.sourceLabel} <span className={`kg-sans text-xs ${muted}`}>({reference.queries.map((query, queryIndex) => <span key={query}><a className="kg-focus text-[var(--color-hero,#006BB3)] underline hover:text-[var(--color-structure,#003A66)]" href={scriptureHref(query)} target="_blank" rel="noopener noreferrer">{query}<span className="sr-only"> (opens Bible in a new tab)</span></a>{queryIndex < reference.queries.length - 1 ? ", " : ""}</span>)})</span></span>}{index < all.length - 1 ? "; " : ""}</span>; })}</p>)}</div>}</>}</section>}
      <aside className={`${view === "topic" && !searching ? "block" : "hidden md:block"} order-4 kg-no-print border-[var(--color-border-soft,#CCEBFF)] bg-[var(--color-surface-soft,#E6F5FF)] p-5 md:order-none md:col-start-2 lg:col-start-auto lg:min-h-[calc(100dvh-95px)] lg:border-l`}>
        {view === "topic" && selected && !searching && selected.seeAlso.length > 0 && <div className="mb-6 border-b border-[var(--color-border-soft,#CCEBFF)] pb-5"><p className={`kg-sans text-xs font-bold uppercase ${muted}`}>See also</p><div className="mt-2 flex flex-wrap gap-2">{uniqueSeeAlsoTargets(selected.seeAlso).map(id => { const target = id === "*" ? undefined : topicById(id); if (id !== "*" && !target) return null; return <button key={id} type="button" data-testid={`button-see-also-${id}`} onClick={() => followCrossReference(id)} className="kg-focus kg-sans min-h-11 rounded border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] px-3 py-2 text-sm font-semibold text-[var(--color-text,#003A66)] hover:bg-[var(--color-selected-warm,#FFEADB)]">{id === "*" ? "Browse all topics" : target?.title}</button>; })}</div></div>}
        <div className="mb-6"><div className="mb-2 flex items-center gap-2 text-[var(--color-action-warm,#C45100)]"><Bookmark size={18} aria-hidden="true"/><h3 ref={studyHeading} tabIndex={-1} id="kg-study-list" data-testid="heading-study-list" className="kg-focus kg-sans scroll-mt-28 text-sm font-bold uppercase">My study list</h3></div>{study.length ? study.map(id => { const item = topicById(id); return item ? <div className="flex items-center border-b border-[var(--color-border-soft,#CCEBFF)]" key={id}><button data-testid={`button-study-${id}`} className="kg-focus min-h-11 flex-1 py-2 text-left text-base font-semibold text-[var(--color-text,#003A66)] hover:text-[var(--color-hero,#006BB3)]" onClick={() => openTopic(item)}>{item.title}</button><button data-testid={`button-remove-study-${id}`} className={`kg-focus flex h-11 w-11 items-center justify-center hover:text-[var(--color-action-warm,#C45100)] ${muted}`} onClick={() => toggleStudy(id)} aria-label={`Remove ${item.title} from study list`}><X size={18}/></button></div> : null; }) : <p className={`kg-sans text-base ${muted}`}>Save topics here as you trace a theme through Scripture.</p>}</div>
        <div className="border-t border-[var(--color-border-soft,#CCEBFF)] pt-5"><p className={`kg-sans text-xs font-bold uppercase ${muted}`}>About Knowing God</p><p className={`mt-2 text-base ${muted}`}>{substantiveTotal || 649} topics and {(index?.counts.passageCount ?? 13535).toLocaleString()} passages, with {(scopedTopics.length - substantiveTotal) || 124} cross-reference entries in the A–Z index.</p></div>
      </aside>
      </div>
      <p className={`kg-sans border-t border-[var(--color-border-soft,#CCEBFF)] px-5 py-5 text-sm leading-relaxed ${muted}`}>
        Scripture quoted by permission. Quotations designated NET are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. netbible.com. All rights reserved.
      </p>
    </div>
    {savedNotice && <div role="status" data-testid="status-saved-topic" className="kg-toast kg-no-print kg-sans fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 rounded bg-[var(--color-structure,#003A66)] py-1 pl-4 pr-1 text-sm font-bold text-[var(--color-surface,#FFFDFB)] shadow-lg">
      <Check size={16} aria-hidden="true"/><span className="mr-1 min-w-0">Saved to My study list</span>
      <button type="button" onClick={viewSaved} data-testid="button-view-saved" className="kg-focus min-h-11 whitespace-nowrap rounded px-2 underline underline-offset-2">View saved</button>
      <button type="button" onClick={() => setSavedNotice(false)} aria-label="Dismiss" data-testid="button-dismiss-saved" className="kg-focus flex h-11 w-11 items-center justify-center rounded"><X size={16} aria-hidden="true"/></button>
    </div>}
    {copyError && <div role="alert" className="kg-sans fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 -translate-x-1/2 rounded bg-[var(--color-action-warm,#C45100)] px-4 py-3 text-base font-bold text-[var(--color-surface,#FFFDFB)] shadow-lg"><AlertCircle size={18}/> {copyError}</div>}{copied && !savedNotice && <div role="status" className="kg-sans fixed bottom-5 left-1/2 z-50 flex items-center gap-2 -translate-x-1/2 rounded bg-[var(--color-structure,#003A66)] px-4 py-3 text-base font-bold text-[var(--color-surface,#FFFDFB)] shadow-lg"><Check size={18}/> {copied === "topic" ? "Topic references copied" : "Verses copied"}</div>}
  </div>;
}

type AdditionalScriptureSection = { sourceValue: string; links: { sourceLabel: string; queries: string[] }[] };
