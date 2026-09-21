import { pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const articleReactionType = pgEnum("article_reaction_type", [
  "helpful",
  "encouraging",
  "disagree",
]);

export const articleReactionsTable = pgTable(
  "article_reactions",
  {
    articleSlug: text("article_slug").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    reaction: articleReactionType("reaction").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("article_reactions_article_visitor_idx").on(
      table.articleSlug,
      table.visitorHash,
    ),
  ],
);

export const insertArticleReactionSchema = createInsertSchema(articleReactionsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertArticleReaction = z.infer<typeof insertArticleReactionSchema>;
export type ArticleReaction = typeof articleReactionsTable.$inferSelect;