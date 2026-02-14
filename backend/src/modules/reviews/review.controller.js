import {
    getApprovedReviews,
    getUserReview,
    createOrUpdateReview,
    deleteReview,
} from "./review.service.js";

// Get all approved reviews (public endpoint)
export const getReviews = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const reviews = await getApprovedReviews(limit);
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

// Get current user's review
export const getMyReview = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const review = await getUserReview(uid);
        res.status(200).json({ success: true, data: review });
    } catch (error) {
        console.error("Error fetching user review:", error);
        res.status(500).json({ success: false, message: "Failed to fetch review" });
    }
};

// Create or update review
export const submitReview = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: "Rating and comment are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const review = await createOrUpdateReview(uid, { rating, comment });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ success: false, message: "Failed to submit review" });
    }
};

// Delete review
export const removeReview = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const result = await deleteReview(uid);
        if (!result) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ success: false, message: "Failed to delete review" });
    }
};
