import express from "express";
import multer from "multer";
import { summarizeMeeting, spellCorrect, enhanceDescription, parsePdfFile } from "./ai.controller.js";
import authCheck from "../../middleware/authCheck.js";

export const aiRoutes = express.Router();

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/ai/meeting-summary
aiRoutes.post("/meeting-summary", authCheck(), summarizeMeeting);

// POST /api/ai/spell-correct
aiRoutes.post("/spell-correct", authCheck(), spellCorrect);

// POST /api/ai/enhance-description
aiRoutes.post("/enhance-description", authCheck(), enhanceDescription);

// POST /api/ai/parse-pdf
aiRoutes.post("/parse-pdf", authCheck(), upload.single("file"), parsePdfFile);
