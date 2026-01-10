import { axiosInstance } from "./axios";

export const videoApi = {
    getToken: async ({ userId, userName }) => {
        if (!userId) {
            throw new Error("User ID is required for video token");
        }
        
        const response = await axiosInstance.post("/video/token", {
            userId,
            userName: userName || "Guest",
        });
        
        // Verify response has required fields
        if (!response.data?.token) {
            throw new Error("Invalid token response from server");
        }
        
        return response.data;
    },
};
