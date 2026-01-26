import express from "express";
import { summarizeMeeting, spellCorrect } from "./ai.controller.js";

export const aiRoutes = express.Router();

// POST /api/ai/meeting-summary
aiRoutes.post("/meeting-summary", summarizeMeeting);

// POST /api/ai/spell-correct
aiRoutes.post("/spell-correct", spellCorrect);
