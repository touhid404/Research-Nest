import express from "express";
import { summarizeMeeting, spellCorrect, enhanceDescription } from "./ai.controller.js";

export const aiRoutes = express.Router();

// POST /api/ai/meeting-summary
aiRoutes.post("/meeting-summary", summarizeMeeting);

// POST /api/ai/spell-correct
aiRoutes.post("/spell-correct", spellCorrect);

// POST /api/ai/enhance-description
aiRoutes.post("/enhance-description", enhanceDescription);
