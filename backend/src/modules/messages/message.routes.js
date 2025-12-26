import express from "express";
import {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    deleteConversation,
    createGroupConversation,
    leaveGroup,
    removeMember,
} from "./message.controller.js";


const router = express.Router();


// Conversation routes
// Conversation routes
// Conversation routes
router.get("/conversations", getConversations);
router.post("/conversations", getOrCreateConversation);
router.post("/conversations/group", createGroupConversation);
router.delete("/conversations/:conversationId", deleteConversation);

// Group management routes
router.put("/conversations/:conversationId/leave", leaveGroup);
router.put("/conversations/:conversationId/kick", removeMember);

// Message routes
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/messages", sendMessage);
router.delete("/messages/:messageId", deleteMessage);
router.put("/conversations/:conversationId/read", markAsRead);

export { router as messageRoutes };
