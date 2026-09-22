import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { articleReactionsTable, db } from "@workspace/db";
import {
  CreateReactionAdminSessionBody,
  CreateReactionAdminSessionResponse,
  DeleteReactionAdminSessionResponse,
  GetArticleReactionsParams,
  GetArticleReactionsResponse,
  GetReactionAdminSessionResponse,
  ListReactionStatsResponse,
  SetArticleReactionBody,
  SetArticleReactionParams,
  SetArticleReactionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const PUBLIC_THRESHOLD = 5;
const VISITOR_COOKIE = "jo_reaction_visitor";
const ADMIN_COOKIE = "jo_reaction_admin";
const ADMIN_SESSION_SECONDS = 60 * 60 * 12;

type ReactionType = "helpful" | "encouraging" | "disagree";

function secureCookie(req: Request) {
  return req.secure || req.get("x-forwarded-proto") === "https";
}

function secret() {
  return process.env.SESSION_SECRET ?? "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function visitorHash(req: Request, res: Response) {
  let visitorId = typeof req.cookies[VISITOR_COOKIE] === "string"
    ? req.cookies[VISITOR_COOKIE]
    : "";
  if (!/^[0-9a-f-]{36}$/i.test(visitorId)) {
    visitorId = randomUUID();
    res.cookie(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie(req),
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }
  return createHash("sha256").update(`${secret()}:${visitorId}`).digest("hex");
}

function createAdminToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  const payload = String(expiresAt);
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function hasAdminSession(req: Request) {
  const token = typeof req.cookies[ADMIN_COOKIE] === "string" ? req.cookies[ADMIN_COOKIE] : "";
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", secret()).update(expiresAt).digest("hex");
  return safeEqual(signature, expected);
}

async function reactionSummary(articleSlug: string, selected: ReactionType | null) {
  const [counts] = await db
    .select({
      helpful: sql<number>`count(*) filter (where ${articleReactionsTable.reaction} = 'helpful')::int`,
      encouraging: sql<number>`count(*) filter (where ${articleReactionsTable.reaction} = 'encouraging')::int`,
    })
    .from(articleReactionsTable)
    .where(eq(articleReactionsTable.articleSlug, articleSlug));

  return {
    articleSlug,
    helpful: counts.helpful >= PUBLIC_THRESHOLD ? counts.helpful : null,
    encouraging: counts.encouraging >= PUBLIC_THRESHOLD ? counts.encouraging : null,
    selected,
  };
}

router.get("/articles/:articleSlug/reactions", async (req, res): Promise<void> => {
  const params = GetArticleReactionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid article." });
    return;
  }
  const hash = visitorHash(req, res);
  const [current] = await db
    .select({ reaction: articleReactionsTable.reaction })
    .from(articleReactionsTable)
    .where(and(
      eq(articleReactionsTable.articleSlug, params.data.articleSlug),
      eq(articleReactionsTable.visitorHash, hash),
    ))
    .limit(1);
  res.json(GetArticleReactionsResponse.parse(
    await reactionSummary(params.data.articleSlug, current?.reaction ?? null),
  ));
});

router.put("/articles/:articleSlug/reactions", async (req, res): Promise<void> => {
  const params = SetArticleReactionParams.safeParse(req.params);
  const body = SetArticleReactionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid article or reaction." });
    return;
  }
  const hash = visitorHash(req, res);
  await db
    .insert(articleReactionsTable)
    .values({
      articleSlug: params.data.articleSlug,
      visitorHash: hash,
      reaction: body.data.reaction,
    })
    .onConflictDoUpdate({
      target: [articleReactionsTable.articleSlug, articleReactionsTable.visitorHash],
      set: { reaction: body.data.reaction, updatedAt: new Date() },
    });
  res.json(SetArticleReactionResponse.parse(
    await reactionSummary(params.data.articleSlug, body.data.reaction),
  ));
});

router.get("/reaction-admin/session", (req, res): void => {
  res.json(GetReactionAdminSessionResponse.parse({ authenticated: hasAdminSession(req) }));
});

router.post("/reaction-admin/session", (req, res): void => {
  const body = CreateReactionAdminSessionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Enter a password." });
    return;
  }
  const configuredPassword = process.env.REACTIONS_ADMIN_PASSWORD;
  if (!configuredPassword) {
    req.log.error("REACTIONS_ADMIN_PASSWORD is not configured");
    res.status(503).json({ error: "The private report is not configured yet." });
    return;
  }
  if (!safeEqual(body.data.password, configuredPassword)) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }
  res.cookie(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: secureCookie(req),
    maxAge: ADMIN_SESSION_SECONDS * 1000,
    path: "/",
  });
  res.json(CreateReactionAdminSessionResponse.parse({ authenticated: true }));
});

router.delete("/reaction-admin/session", (_req, res): void => {
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
  res.json(DeleteReactionAdminSessionResponse.parse({ authenticated: false }));
});

router.get("/reaction-admin/stats", async (req, res): Promise<void> => {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "Sign in to view this report." });
    return;
  }
  const stats = await db
    .select({
      articleSlug: articleReactionsTable.articleSlug,
      helpful: sql<number>`count(*) filter (where ${articleReactionsTable.reaction} = 'helpful')::int`,
      encouraging: sql<number>`count(*) filter (where ${articleReactionsTable.reaction} = 'encouraging')::int`,
      disagree: sql<number>`count(*) filter (where ${articleReactionsTable.reaction} = 'disagree')::int`,
      total: sql<number>`count(*)::int`,
      updatedAt: sql<string | null>`max(${articleReactionsTable.updatedAt})`,
    })
    .from(articleReactionsTable)
    .groupBy(articleReactionsTable.articleSlug)
    .orderBy(desc(sql`count(*)`));
  res.json(ListReactionStatsResponse.parse(stats));
});

export default router;