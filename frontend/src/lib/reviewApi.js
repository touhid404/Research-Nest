import { axiosInstance, axiosPublic } from "./axios";

export const reviewApi = {
    // Get all approved reviews (public)
    getReviews: async (limit = 50) => {
        const response = await axiosPublic.get(`/reviews?limit=${limit}`);
        return response.data;
    },

    // Get current user's review
    getMyReview: async () => {
        const response = await axiosInstance.get("/reviews/my-review");
        return response.data;
    },

    // Submit a review (create or update)
    submitReview: async (rating, comment) => {
        const response = await axiosInstance.post("/reviews", { rating, comment });
        return response.data;
    },

    // Delete my review
    deleteReview: async () => {
        const response = await axiosInstance.delete("/reviews");
        return response.data;
    },
};
