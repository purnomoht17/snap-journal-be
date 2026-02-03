import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { web } from "./src/applications/web.js";
import { logger } from "./src/applications/logging.js";
import { checkInactiveUsers } from "./src/jobs/checkInactiveUsers.js";

logger.info("🚀 SnapJournal Cloud Function ready.");

const REGION = "asia-southeast2";

const HTTP_OPTIONS = {
  region: REGION,
  memory: "2GiB",
  maxInstances: 10,
};

const SCHEDULE_OPTIONS = {
  region: REGION,
  schedule: "0 * * * *",
  timezone: "Asia/Jakarta",
  memory: "256MiB",
};

export const api = onRequest(HTTP_OPTIONS, web);

export const inactiveUserJob = onSchedule(
  SCHEDULE_OPTIONS,
  async () => {
    logger.info("⏰ Running checkInactiveUsers job...");
    try {
      await checkInactiveUsers();
      logger.info("✅ Job finished.");
    } catch (err) {
      logger.error("❌ Job failed:", err);
      throw err;
    }
  }
);
