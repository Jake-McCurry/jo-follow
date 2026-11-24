import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { getGetBiblePassageQueryKey, getListBibleBooksQueryKey, getGetBiblePassageQueryOptions, getListBibleBooksQueryOptions } from "@workspace/api-client-react";
import { BIBLE_QUERY_STALE_MS, preloadBibleRoute } from "../src/lib/bible-route-preload";

const makeClient = () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

test("initial chapter preparation populates the reader's exact translation-specific cache", async t => {
  const client = makeClient();
  const requests: URL[] = [];
  t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input), "https://example.com");
    requests.push(url);
    return url.pathname.endsWith("/books")
      ? Response.json([{ id: "1 John", name: "1 John", chapters: 5 }])
      : Response.json({ reference: "1 John 3", version: url.searchParams.get("version"), verses: [] });
  });
  try {
    await preloadBibleRoute("/bible/1%20John/3", "?version=KJV", client);
    assert.equal(client.getQueryData<{ version: string }>(getGetBiblePassageQueryKey({ passage: "1 John 3", version: "KJV" }))?.version, "KJV");
    assert.ok(client.getQueryData(getListBibleBooksQueryKey()));
    assert.equal(requests.length, 2);
    assert.equal(requests.filter(url => url.searchParams.get("version") === "KJV").length, 1);
    assert.equal(requests.filter(url => url.searchParams.get("version") === "NET").length, 0);
    const books = new QueryObserver(client, getListBibleBooksQueryOptions({ query: { queryKey: getListBibleBooksQueryKey(), staleTime: BIBLE_QUERY_STALE_MS } }));
    const passage = new QueryObserver(client, getGetBiblePassageQueryOptions(
      { passage: "1 John 3", version: "KJV" }, { query: { queryKey: getGetBiblePassageQueryKey({ passage: "1 John 3", version: "KJV" }), staleTime: BIBLE_QUERY_STALE_MS } },
    ));
    const stopBooks = books.subscribe(() => {});
    const stopPassage = passage.subscribe(() => {});
    await new Promise<void>(resolve => setImmediate(resolve));
    stopBooks();
    stopPassage();
    assert.equal(requests.length, 2, "Reader mount must reuse the prepared data rather than refetch both endpoints.");
  } finally { client.clear(); }
});

test("slow chapter requests do not indefinitely block the original loading interface", async t => {
  const client = makeClient();
  t.mock.method(globalThis, "fetch", () => new Promise<Response>(() => {}));
  try {
    await preloadBibleRoute("/bible/John/3", "", client, 5);
    assert.equal(client.getQueryData(getGetBiblePassageQueryKey({ passage: "John 3", version: "NET" })), undefined);
    assert.equal(client.getQueryState(getGetBiblePassageQueryKey({ passage: "John 3", version: "NET" }))?.fetchStatus, "fetching");
  } finally { await client.cancelQueries(); client.clear(); }
});

test("failed NET requests do not fabricate text or fall back to KJV", async t => {
  const client = makeClient();
  const requests: string[] = [];
  t.mock.method(globalThis, "fetch", async input => {
    requests.push(String(input));
    return new Response("Temporarily unavailable", { status: 503 });
  });
  try {
    await preloadBibleRoute("/bible/John/3", "", client);
    const key = getGetBiblePassageQueryKey({ passage: "John 3", version: "NET" });
    assert.equal(client.getQueryState(key)?.status, "error");
    assert.equal(client.getQueryData(key), undefined);
    assert.ok(requests.every(url => !url.includes("version=KJV")));
  } finally { client.clear(); }
});
