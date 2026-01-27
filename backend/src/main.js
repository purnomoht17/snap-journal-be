import {web} from "./applications/web.js";
import {logger} from "./applications/logging.js";
import cron from "node-cron";
import { checkInactiveUsers } from "./jobs/checkInactiveUsers.js";

const PORT = process.env.PORT || 3001;

web.listen(PORT, () => {
    logger.info("App start");
});

cron.schedule("0 * * * *", () => {
    checkInactiveUsers();
});