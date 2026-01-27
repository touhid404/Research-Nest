import { axiosInstance as api } from "./axios";

export const aiApi = {
    enhanceDescription: async (payload) => {
        const response = await api.post("/ai/enhance-description", payload);
        return response.data.data;
    },
    spellCorrect: async (payload) => {
        const response = await api.post("/ai/spell-correct", payload);
        return response.data.data;
    },
    summarizeMeeting: async (payload) => {
        const response = await api.post("/ai/meeting-summary", payload);
        return response.data;
    },
    parsePdf: async (formData) => {
        // Must send formData with 'file' key
        const response = await api.post("/ai/parse-pdf", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }
};
