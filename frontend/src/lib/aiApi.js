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
    /**
     * Upload recorded audio and get transcription + AI summary.
     * @param {Blob} audioBlob - The recorded audio blob
     * @param {string} meetingId - The meeting ID to associate the summary with
     */
    transcribeMeeting: async (audioBlob, meetingId, recordedBy = null, recordedByName = null) => {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        formData.append("meetingId", meetingId);
        if (recordedBy) formData.append("recordedBy", recordedBy);
        if (recordedByName) formData.append("recordedByName", recordedByName);

        const response = await api.post("/ai/transcribe-meeting", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 180000, // 3 minutes for transcription + summarization
        });
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

