import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminLoginAttemptsTable = pgTable("admin_login_attempts", {
  scope: text("scope").primaryKey(),
  attempts: integer("attempts").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export const insertAdminLoginAttemptSchema = createInsertSchema(adminLoginAttemptsTable);
export type InsertAdminLoginAttempt = z.infer<typeof insertAdminLoginAttemptSchema>;
export type AdminLoginAttempt = typeof adminLoginAttemptsTable.$inferSelect;