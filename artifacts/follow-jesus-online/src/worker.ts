import {
  BIBLE_BOOKS,
  BibleServiceError,
  getNetBiblePassage,
  isSafeBibleReference,
} from "../../api-server/src/lib/bible";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const API_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Cross-Origin-Resource-Policy": "same-site",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return Response.json(data, {
    status,
    headers: {
      ...API_HEADERS,
      ...Object.fromEntries(new Headers(extraHeaders)),
    },
  });
}

function methodNotAllowed(): Response {
  return json(
    { error: "Method not allowed." },
    405,
    { Allow: "GET" },
  );
}

async function handleBibleApi(request: Request, url: URL): Promise<Response> {
  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  if (url.pathname === "/api/bible/books") {
    return json(BIBLE_BOOKS);
  }

  if (url.pathname === "/api/bible/passage") {
    const reference = url.searchParams.get("passage") ?? "";
    if (!isSafeBibleReference(reference)) {
      return json(
        {
          error:
            "Enter a valid Bible reference, such as John 3 or Romans 8:1-11.",
        },
        400,
      );
    }

    try {
      return json(await getNetBiblePassage(reference));
    } catch (error) {
      if (error instanceof BibleServiceError) {
        console.warn("Bible passage request could not be completed", {
          status: error.status,
        });
        return json({ error: error.message }, error.status);
      }

      console.error("Unexpected Bible service error", error);
      return json(
        { error: "The Bible service is temporarily unavailable." },
        502,
      );
    }
  }

  return json({ error: "API route not found." }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/bible/")) {
      return handleBibleApi(request, url);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const response = new Response(assetResponse.body, assetResponse);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  },
};