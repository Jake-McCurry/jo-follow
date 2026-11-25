import type { QueryClient } from "@tanstack/react-query";
import { getGetBiblePassageQueryOptions, getListBibleBooksQueryOptions, getListBibleBooksQueryKey, getGetBiblePassageQueryKey } from "@workspace/api-client-react";

export const BIBLE_QUERY_STALE_MS = 60_000;

/** Populate the same cache used by the reader, without delaying an unavailable API indefinitely. */
export async function preloadBibleRoute(
  pathname: string,
  search: string,
  client: QueryClient,
  timeoutMs = 800,
): Promise<void> {
  const route = pathname.match(/^\/bible\/([^/]+)\/([^/]+)\/?$/);
  if (!route) return;
  let book = "John";
  try { book = decodeURIComponent(route[1]); } catch { /* Match the reader's invalid-encoding handling. */ }
  const parsed = Number.parseInt(route[2], 10);
  const chapter = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
  const version = new URLSearchParams(search).get("version") === "KJV" ? "KJV" : "NET";
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.all([
        client.prefetchQuery(getListBibleBooksQueryOptions({ query: { queryKey: getListBibleBooksQueryKey(), staleTime: BIBLE_QUERY_STALE_MS } })),
        client.prefetchQuery(getGetBiblePassageQueryOptions(
          { passage: `${book} ${chapter}`, version },
          { query: { queryKey: getGetBiblePassageQueryKey({ passage: `${book} ${chapter}`, version }), staleTime: BIBLE_QUERY_STALE_MS } },
        )),
      ]),
      new Promise<void>(resolve => { timer = setTimeout(resolve, timeoutMs); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
