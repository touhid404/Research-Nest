import express from "express";
import {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    deleteConversation,
} from "./message.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Protect all message routes
// router.use(authMiddleware);

// Conversation routes
router.get("/conversations", getConversations);
router.post("/conversations", getOrCreateConversation);
router.delete("/conversations/:conversationId", deleteConversation);

// Message routes
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/messages", sendMessage);
router.delete("/messages/:messageId", deleteMessage);
router.put("/conversations/:conversationId/read", markAsRead);

export { router as messageRoutes };
