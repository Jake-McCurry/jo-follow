-- Additive, idempotent migration. Apply before running the hardened Express API.
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  scope text PRIMARY KEY,
  attempts integer NOT NULL,
  reset_at timestamptz NOT NULL
);