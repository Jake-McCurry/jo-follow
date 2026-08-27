import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const clients = new Map<string, { count: number; resetAt: number }>();

export function applyPublicApiSecurity(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Cache-Control", "no-store");
  next();
}

export function rateLimitPublicApi(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const now = Date.now();
  const key = req.ip || "unknown";
  const client = clients.get(key);

  if (!client || client.resetAt <= now) {
    clients.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  client.count += 1;
  if (client.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader("Retry-After", Math.ceil((client.resetAt - now) / 1_000));
    res.status(429).json({ error: "Please wait a moment before requesting more passages." });
    return;
  }

  next();
}