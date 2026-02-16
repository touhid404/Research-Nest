import { axiosInstance } from "./axios";

export const proposalApi = {
    // Create a new proposal post
    createProposalPost: async (postData) => {
        const response = await axiosInstance.post("/posts", postData);
        return response.data;
    },

    // Get all proposal posts
    getAllProposalPosts: async (excludeUid, page, limit, topic) => {
        let url = `/posts?page=${page}&limit=${limit}`;
        if (excludeUid) {
            url += `&excludeUid=${excludeUid}`;
        }
        if (topic) {
            url += `&topic=${encodeURIComponent(topic)}`;
        }
        const response = await axiosInstance.get(url);
        return response.data;
    },

    // Get all proposal posts by a specific user
    getAllProposalPostsByUser: async (uid) => {
        const response = await axiosInstance.get(`/posts/user/${uid}`);
        return response.data;
    },

    // Get a single proposal post by ID
    getProposalPostById: async (id) => {
        const response = await axiosInstance.get(`/posts/${id}`);
        return response.data;
    },

    // Update a proposal post
    updateProposalPost: async (id, updateData) => {
        const response = await axiosInstance.put(`/posts/${id}`, updateData);
        return response.data;
    },

    // Delete a proposal post
    deleteProposalPost: async (id) => {
        const response = await axiosInstance.delete(`/posts/${id}`);
        return response.data;
    },

    // Get trending topics
    getTrendingTopics: async (limit = 5) => {
        const response = await axiosInstance.get(`/posts/trending-topics?limit=${limit}`);
        return response.data;
    },

    // Get matching/for you posts
    getForYouPosts: async (page = 1, limit = 8) => {
        const response = await axiosInstance.get(`/posts/for-you?page=${page}&limit=${limit}`);
        return response.data;
    },
};
