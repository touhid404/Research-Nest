import { axiosInstance } from "./axios";

export const chatApi = {
    // Get all conversations
    getConversations: async () => {
        const response = await axiosInstance.get("/messages/conversations");
        return response.data;
    },

    // Get all users for chat
    getAllUsers: async () => {
        const response = await axiosInstance.get("/users");
        return response.data;
    },

    // Get or create conversation with another user
    getOrCreateConversation: async (otherUserId) => {
        const response = await axiosInstance.post("/messages/conversations", {
            otherUserId
        });
        return response.data;
    },

    // Create group conversation
    createGroupConversation: async (data) => {
        const response = await axiosInstance.post("/messages/conversations/group", data);
        return response.data;
    },

    // Leave group
    leaveGroup: async (conversationId) => {
        const response = await axiosInstance.put(`/messages/conversations/${conversationId}/leave`);
        return response.data;
    },

    // Remove member from group
    removeMember: async (conversationId, memberId) => {
        const response = await axiosInstance.put(`/messages/conversations/${conversationId}/kick`, { memberId });
        return response.data;
    },

    // Get messages for a conversation
    getMessages: async (conversationId, params) => {
        const response = await axiosInstance.get(
            `/messages/conversations/${conversationId}/messages`,
            { params }
        );
        return response.data;
    },

    // Send a message
    sendMessage: async (data) => {
        const response = await axiosInstance.post("/messages/messages", data);
        return response.data;
    },

    // Mark messages as read
    markAsRead: async (conversationId) => {
        const response = await axiosInstance.put(
            `/messages/conversations/${conversationId}/read`
        );
        return response.data;
    },

    // Delete a message
    deleteMessage: async (messageId) => {
        const response = await axiosInstance.delete(`/messages/messages/${messageId}`);
        return response.data;
    },

    // Delete a conversation
    deleteConversation: async (conversationId) => {
        const response = await axiosInstance.delete(`/messages/conversations/${conversationId}`);
        return response.data;
    },

    // Upload attachment
    uploadAttachment: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axiosInstance.post("/messages/upload-attachment", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // Block a user
    blockUser: async (blockUid) => {
        const response = await axiosInstance.post("/messages/block", { blockUid });
        return response.data;
    },

    // Unblock a user
    unblockUser: async (unblockUid) => {
        const response = await axiosInstance.post("/messages/unblock", { unblockUid });
        return response.data;
    },

    // Get blocked users
    getBlockedUsers: async () => {
        const response = await axiosInstance.get("/messages/blocked-users");
        return response.data;
    },
};
