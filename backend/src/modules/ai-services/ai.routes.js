import express from "express";
import multer from "multer";
import { summarizeMeeting, spellCorrect, enhanceDescription, parsePdfFile, transcribeAndSummarize } from "./ai.controller.js";
import authCheck from "../../middleware/authCheck.js";

export const aiRoutes = express.Router();

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Larger limit for audio uploads (50MB)
const audioUpload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for audio
});

// POST /api/ai/meeting-summary
aiRoutes.post("/meeting-summary", authCheck(), summarizeMeeting);

// POST /api/ai/spell-correct
aiRoutes.post("/spell-correct", authCheck(), spellCorrect);

// POST /api/ai/enhance-description
aiRoutes.post("/enhance-description", authCheck(), enhanceDescription);

// POST /api/ai/parse-pdf
aiRoutes.post("/parse-pdf", authCheck(), upload.single("file"), parsePdfFile);

// POST /api/ai/transcribe-meeting - Audio transcription + AI summary
aiRoutes.post("/transcribe-meeting", authCheck(), audioUpload.single("audio"), transcribeAndSummarize);

