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
    uploadAttachment,
    blockUser,
    unblockUser,
    getBlockedUsers,
} from "./message.controller.js";
import authCheck from "../../middleware/authCheck.js";
import { chatUpload } from "../../middleware/chatUpload.middleware.js";


const router = express.Router();


// Conversation routes
router.get("/conversations", authCheck(), getConversations);
router.post("/conversations", authCheck(), getOrCreateConversation);
router.post("/conversations/group", authCheck(), createGroupConversation);
router.delete("/conversations/:conversationId", authCheck(), deleteConversation);

// Group management routes
router.put("/conversations/:conversationId/leave", authCheck(), leaveGroup);
router.put("/conversations/:conversationId/kick", authCheck(), removeMember);

// Message routes
router.get("/conversations/:conversationId/messages", authCheck(), getMessages);
router.post("/messages", authCheck(), sendMessage);
router.post("/upload-attachment", authCheck(), chatUpload.single("file"), uploadAttachment);
router.delete("/messages/:messageId", authCheck(), deleteMessage);
router.put("/conversations/:conversationId/read", authCheck(), markAsRead);

// Block routes
router.post("/block", authCheck(), blockUser);
router.post("/unblock", authCheck(), unblockUser);
router.get("/blocked-users", authCheck(), getBlockedUsers);

export { router as messageRoutes };
