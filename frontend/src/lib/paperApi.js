import { axiosInstance } from "./axios";


export const paperApi = {
    // Publish a new paper
    createPaper: async (paperData) => {
        // expect FormData because of file upload
        const response = await axiosInstance.post("/papers", paperData);
        return response.data;
    },


    // Get all papers
    getAllPapers: async (excludeUid, page = 1, limit = 10, filters = {}) => {
        let url = `/papers?page=${page}&limit=${limit}`;
        if (excludeUid) {
            url += `&excludeUid=${excludeUid}`;
        }
        
        // Add additional filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                url += `&${key}=${encodeURIComponent(value)}`;
            }
        });

        const response = await axiosInstance.get(url);
        return response.data;
    },


    // Get all papers by a specific user
    getAllPapersByUser: async (uid, page = 1, limit = 10, filters = {}) => {
        let url = `/papers/user/${uid}?page=${page}&limit=${limit}`;
        
        // Add additional filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                url += `&${key}=${encodeURIComponent(value)}`;
            }
        });

        const response = await axiosInstance.get(url);
        return response.data;
    },



    // Get a single paper by ID
    getPaperById: async (id) => {
        const response = await axiosInstance.get(`/papers/${id}`);
        return response.data;
    },


    // Delete a paper
    deletePaper: async (id) => {
        const response = await axiosInstance.delete(`/papers/${id}`);
        return response.data;
    },
    
    // Update a paper
    updatePaper: async (id, paperData) => {
        const response = await axiosInstance.patch(`/papers/${id}`, paperData);
        return response.data;
    },

    // Get unique research domains
    getResearchDomains: async () => {
        const response = await axiosInstance.get("/papers/domains");
        return response.data;
    },

    // Check if paper is already requested
    checkRequestStatus: async (paperId, requesterUid) => {
        const response = await axiosInstance.get(`/papers/request/status?paperId=${paperId}&requesterUid=${requesterUid}`);
        return response.data;
    },

    // Record paper request
    recordRequest: async (requestData) => {
        const response = await axiosInstance.post("/papers/request/record", requestData);
        return response.data;
    },
};



