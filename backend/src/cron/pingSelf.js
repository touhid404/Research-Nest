import cron from "node-cron";
import axios from "axios";
import { config } from "../config/config.js";

const PING_URL = config.pingUrl;
// Run every 14 minutes only in production
if (config.nodeEnv === "production") {
  cron.schedule("*/14 * * * *", async () => {
    try {
      const res = await axios.get(PING_URL);
      console.log(`Don't Sleep ........... Iam Alive MR.: ${PING_URL}`);
    } catch (err) {
      console.error(`[CRON] Error pinging self:`, err.message);
    }
  });
}
