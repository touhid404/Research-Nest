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
};
