import { axiosInstance } from "./axios";

export const proposalApi = {
    // Create a new proposal post
    createProposalPost: async (postData) => {
        const response = await axiosInstance.post("/posts", postData);
        return response.data;
    },

    // Get all proposal posts
    getAllProposalPosts: async (excludeUid, page, limit) => {
        let url = `/posts?page=${page}&limit=${limit}`;
        if (excludeUid) {
            url += `&excludeUid=${excludeUid}`;
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
};
