import { axiosInstance } from "./axios";

export const searchApi = {
    globalSearch: async (query) => {
        try {
            const response = await axiosInstance.get(`/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error("Search API Error:", error);
            throw error;
        }
    }
};
