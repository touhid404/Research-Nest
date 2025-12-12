import express from "express";
import {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
} from "./message.controller.js";

const router = express.Router();

// Conversation routes
router.get("/conversations", getConversations);
router.post("/conversations", getOrCreateConversation);

// Message routes
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/messages", sendMessage);
router.put("/conversations/:conversationId/read", markAsRead);

export { router as messageRoutes };
