import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export const ADMIN_LOGIN_MAX_ATTEMPTS = 10;
export const ADMIN_LOGIN_WINDOW_SECONDS = 15 * 60;

// One fixed account key, not an attacker-controlled IP/cookie/password. The
// database clock and atomic upsert keep the budget shared across all instances.
export async function consumeAdminLoginAttempt(scope = "reaction-admin"): Promise<number> {
  const result = await db.execute<{ retry_after: number }>(sql`
    INSERT INTO admin_login_attempts AS attempts (scope, attempts, reset_at)
    VALUES (${scope}, 1, statement_timestamp() + ${ADMIN_LOGIN_WINDOW_SECONDS} * interval '1 second')
    ON CONFLICT (scope) DO UPDATE SET
      attempts = CASE WHEN attempts.reset_at <= statement_timestamp() THEN 1
        ELSE LEAST(attempts.attempts + 1, ${ADMIN_LOGIN_MAX_ATTEMPTS + 1}) END,
      reset_at = CASE WHEN attempts.reset_at <= statement_timestamp()
        THEN statement_timestamp() + ${ADMIN_LOGIN_WINDOW_SECONDS} * interval '1 second'
        ELSE attempts.reset_at END
    RETURNING CASE WHEN attempts > ${ADMIN_LOGIN_MAX_ATTEMPTS}
      THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (reset_at - statement_timestamp()))))::int
      ELSE 0 END AS retry_after
  `);
  return result.rows[0].retry_after;
}