import express from "express";
import { summarizeMeeting } from "./ai.controller.js";

export const aiRoutes = express.Router();

// POST /api/ai/meeting-summary
aiRoutes.post("/meeting-summary", summarizeMeeting);
