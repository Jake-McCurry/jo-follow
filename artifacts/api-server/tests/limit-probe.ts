import { consumeAdminLoginAttempt } from "../src/lib/admin-login-limit";
import { pool } from "@workspace/db";

consumeAdminLoginAttempt()
  .then((retryAfter) => console.log(retryAfter))
  .catch(() => { process.exitCode = 1; })
  .finally(() => pool.end());