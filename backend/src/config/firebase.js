import admin from "firebase-admin";
import { config } from "./config.js";

const decoded = Buffer.from(config.fbServiceKey, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
