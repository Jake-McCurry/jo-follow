import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGetBiblePassage, getGetBiblePassageQueryKey } from "@workspace/api-client-react";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertCircle, Book, Plus, X } from "lucide-react";
import { type ParsedRef, readerHref, refLabel } from "@/lib/bible-resources";

/** NET-only preview. Cross-chapter ranges fetch each chapter and trim to the cited verses. */
function PreviewBody({ reference, enabled }: { reference: ParsedRef; enabled: boolean }) {
  const crosses = reference.endChapter !== reference.startChapter;
  const passage = crosses
    ? `${reference.book} ${reference.startChapter}:${reference.startVerse}-${reference.endChapter}:${reference.endVerse}`
    : refLabel(reference);
  const params = { passage, version: "NET" as const };
  const { data, isLoading, error, refetch, isFetching } = useGetBiblePassage(params, {
    query: { enabled, queryKey: getGetBiblePassageQueryKey(params), staleTime: 1000 * 60 * 60 * 24, retry: 0 },
  });

  if (isLoading) {
    return (
      <div className="space-y-2 py-2" aria-live="polite">
        <span className="sr-only">Loading NET passage</span>
        <div className="h-3 w-11/12 animate-pulse rounded bg-warm-100" />
        <div className="h-3 w-10/12 animate-pulse rounded bg-warm-100" />
        <div className="h-3 w-7/12 animate-pulse rounded bg-warm-100" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex flex-col items-start gap-2 py-1 text-sm text-destructive" role="alert">
        <span className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />The NET text could not be loaded.</span>
        <button type="button" onClick={() => refetch()} disabled={isFetching}
          className="min-h-11 rounded-md border border-warm-300 px-3 text-sm font-semibold text-navy hover:bg-warm-50">
          {isFetching ? "Trying again…" : "Try again"}
        </button>
      </div>
    );
  }
  const verses = data.verses.filter((v) => {
    const after = v.chapter > reference.startChapter || (v.chapter === reference.startChapter && v.verse >= reference.startVerse);
    const before = v.chapter < reference.endChapter || (v.chapter === reference.endChapter && v.verse <= reference.endVerse);
    return after && before;
  });
  const returnedVersion = String((data as { version?: string; translation?: string }).version ?? (data as { translation?: string }).translation ?? "NET").toUpperCase();
  if (returnedVersion !== "NET") {
    return <p className="py-1 text-sm text-destructive" role="alert">The NET text for this passage isn’t available right now, so no preview is shown. Open the reference to read it.</p>;
  }
  if (!verses.length) {
    return <p className="py-1 text-sm text-destructive" role="alert">These verses couldn’t be found in the NET text. Open the reference to read the chapter.</p>;
  }
  const shown = verses;
  const lastShown = shown.at(-1);
  const incomplete = !lastShown || lastShown.chapter < reference.endChapter || (lastShown.chapter === reference.endChapter && lastShown.verse < reference.endVerse);
  return (
    <div className="space-y-2 text-[0.95rem] leading-relaxed text-foreground/90">
      <p>
        {shown.map((v, i) => (
          <span key={`${v.chapter}-${v.verse}-${i}`} className="mr-1">
            <sup className="mr-0.5 text-[0.65em] font-bold text-warm-700">{crosses && v.verse === 1 ? `${v.chapter}:${v.verse}` : v.verse}</sup>
            {v.text}
          </span>
        ))}
      </p>
      {incomplete && <p className="text-xs italic text-muted-foreground">Preview shows only part of this range. Open the reference to read it all.</p>}
      <p className="text-xs text-muted-foreground">{data.copyright}</p>
    </div>
  );
}

export function ScripturePreview({ reference, children }: { reference: ParsedRef; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const label = refLabel(reference);
  const clear = () => { clearTimeout(openTimer.current); clearTimeout(closeTimer.current); };
  useEffect(() => clear, []);
  const canHover = () => window.matchMedia?.("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches;
  const enter = () => { if (!canHover()) return; clear(); openTimer.current = setTimeout(() => setOpen(true), 300); };
  const leave = () => { clear(); closeTimer.current = setTimeout(() => setOpen(false), 200); };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <span className="inline" onMouseEnter={enter} onMouseLeave={leave}>
          <a href={readerHref(reference)} target="_blank" rel="noopener"
            onFocus={() => { if (canHover()) setOpen(true); }}
            className="scripture-link" aria-label={`${label} (opens in the Bible reader in a new tab)`}
            data-testid="link-scripture">
            {children}
          </a>
          <PopoverTrigger asChild>
            <button type="button" className="scripture-toggle" aria-label={`Preview ${label} (NET)`} aria-expanded={open} data-testid="button-scripture-preview">
              <span className="relative inline-flex h-4 w-4 items-center justify-center">
                <Book className="h-4 w-4" aria-hidden />
                <Plus className="absolute left-[5px] top-[2px] h-2.5 w-2.5" strokeWidth={3} aria-hidden />
              </span>
            </button>
          </PopoverTrigger>
        </span>
      </PopoverAnchor>
      <PopoverContent
        side="top" sideOffset={8} collisionPadding={12}
        className="w-[min(22rem,calc(100vw-1.5rem))] border-card-border bg-card p-0 shadow-lg"
        onMouseEnter={clear} onMouseLeave={leave}
        onOpenAutoFocus={(e) => { if (canHover()) e.preventDefault(); }}
        onEscapeKeyDown={() => setOpen(false)}
      >
        <div className="flex items-center justify-between gap-2 border-b border-warm-200 py-1 pl-4 pr-1">
          <p className="font-serif text-base font-bold text-navy">{label} <span className="text-xs font-sans text-muted-foreground">NET</span></p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close preview"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-warm-50 hover:text-navy">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[min(18rem,50vh)] overflow-y-auto px-4 py-3" tabIndex={0} aria-label={`${label} text`}>
          <PreviewBody reference={reference} enabled={open} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
