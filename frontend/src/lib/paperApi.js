import { axiosInstance } from "./axios";


export const paperApi = {
    // Publish a new paper
    createPaper: async (paperData) => {
        // expect FormData because of file upload
        const response = await axiosInstance.post("/papers", paperData);
        return response.data;
    },


    // Get all papers
    getAllPapers: async (excludeUid) => {
        let url = "/papers";
        if (excludeUid) {
            url += `?excludeUid=${excludeUid}`;
        }
        const response = await axiosInstance.get(url);
        return response.data;
    },


    // Get all papers by a specific user
    getAllPapersByUser: async (uid) => {
        const response = await axiosInstance.get(`/papers/user/${uid}`);
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
};



