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
};
