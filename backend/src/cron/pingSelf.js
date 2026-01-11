import cron from "node-cron";
import axios from "axios";

// Replace with your Render backend public URL or set in .env as PING_URL
const PING_URL = process.env.PING_URL || "https://your-backend.onrender.com/health";

// Run every 14 minutes
cron.schedule("*/14 * * * *", async () => {
  try {
    const res = await axios.get(PING_URL);
    console.log(`[CRON] Pinged self: ${PING_URL} - Status: ${res.status}`);
  } catch (err) {
    console.error(`[CRON] Error pinging self:`, err.message);
  }
});
