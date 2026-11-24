import { useEffect, useRef, useState } from "react";
import { normalizeBibleSearch, type BibleSearchResponse, type BibleTranslation } from "../lib/full-bible-search";

export function useFullBibleSearch(query: string, version: BibleTranslation, testament: string, book: string) {
  const worker = useRef<Worker | null>(null);
  const sequence = useRef(0);
  const scope = JSON.stringify([query, version, testament, book]);
  const [paging, setPaging] = useState({ scope, page: 1 });
  const page = paging.scope === scope ? paging.page : 1;
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify([scope, page, retry]);
  const [state, setState] = useState<{ key: string; response: BibleSearchResponse } | null>(null);

  useEffect(() => () => { worker.current?.terminate(); worker.current = null; }, []);
  useEffect(() => {
    const id = ++sequence.current;
    if (!normalizeBibleSearch(query)) {
      worker.current?.postMessage({ type: "cancel", id });
      return;
    }
    let current = true;
    const fail = () => {
      if (!current) return;
      setState({ key, response: { id, version, status: "error", results: [], total: 0, page, pages: 1, error: "Bible search could not start. Please retry." } });
      worker.current?.terminate();
      worker.current = null;
    };
    const receive = (event: MessageEvent<BibleSearchResponse>) => {
      if (current && event.data.id === id && event.data.version === version) setState({ key, response: event.data });
    };
    const timer = window.setTimeout(() => {
      try {
        worker.current ??= new Worker(new URL("../workers/bible-search.worker.ts", import.meta.url), { type: "module" });
        worker.current.addEventListener("message", receive);
        worker.current.addEventListener("error", fail);
        worker.current.postMessage({ type: "search", id, version, query, testament, book, page, baseUrl: import.meta.env.BASE_URL });
      } catch { fail(); }
    }, 180);
    return () => {
      current = false;
      window.clearTimeout(timer);
      worker.current?.removeEventListener("message", receive);
      worker.current?.removeEventListener("error", fail);
      worker.current?.postMessage({ type: "cancel", id: ++sequence.current });
    };
  }, [query, version, testament, book, page, key]);

  return {
    response: state?.key === key ? state.response : null,
    setPage: (next: number) => setPaging({ scope, page: next }),
    retry: () => setRetry(value => value + 1),
  };
}
