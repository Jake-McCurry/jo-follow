import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_SECONDS = 60 * 60 * 12;

export function requireSessionSecret(value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error("SESSION_SECRET must be set to sign and verify reaction admin sessions.");
  }
  return value;
}

// Validate at module load, before the server can accept any requests.
const sessionSecret = requireSessionSecret(process.env.SESSION_SECRET);

export function secret(): string {
  return sessionSecret;
}

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminToken(now = Date.now()): string {
  const payload = String(Math.floor(now / 1000) + ADMIN_SESSION_SECONDS);
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token: unknown, now = Date.now()): boolean {
  if (typeof token !== "string" || !/^[0-9]{1,16}\.[0-9a-f]{64}$/.test(token)) return false;
  const [expiresAt, signature] = token.split(".");
  const expiry = Number(expiresAt);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(now / 1000)) return false;
  const expected = createHmac("sha256", secret()).update(expiresAt).digest("hex");
  return safeEqual(signature, expected);
}