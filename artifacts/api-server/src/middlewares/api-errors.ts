import type { ErrorRequestHandler } from "express";

/** Never send parser details, request bodies, or stack traces to API clients. */
export const apiErrorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  const type = typeof error === "object" && error !== null && "type" in error
    ? error.type
    : undefined;
  if (type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON request." });
    return;
  }
  if (type === "entity.too.large") {
    res.status(413).json({ error: "Request body is too large." });
    return;
  }
  if (type === "encoding.unsupported" || type === "charset.unsupported") {
    res.status(415).json({ error: "Unsupported request encoding." });
    return;
  }
  if (type === "request.aborted" || type === "request.size.invalid") {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }
  // Error messages can themselves contain a supplied password or other input.
  req.log?.error(
    { errorName: error instanceof Error ? error.name : "UnknownError" },
    "Unexpected API request error",
  );
  res.status(500).json({ error: "The request could not be completed." });
};