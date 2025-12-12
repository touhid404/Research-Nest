import admin from "firebase-admin";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
let serviceAccount;

try {
    // Try to load from local file first
    try {
        serviceAccount = require("../../serviceAccountKey.json");
    } catch (e) {
        // If file not found, check env vars (fallback) or throw
        console.warn("serviceAccountKey.json not found, verifying env vars...");
        if (process.env.FIREBASE_PRIVATE_KEY) {
            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin Initialized successfully");
    } else {
        console.error("Firebase Admin: No credentials found (file or env)");
    }

} catch (error) {
    console.error("Firebase admin initialization failed", error);
}

export default admin;
