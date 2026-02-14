import express from "express";
import {
    getReviews,
    getMyReview,
    submitReview,
    removeReview,
} from "./review.controller.js";

const router = express.Router();

// Public endpoint - get all approved reviews
router.get("/", getReviews);

// Protected endpoints - require user to be logged in
router.get("/my-review", getMyReview);
router.post("/", submitReview);
router.delete("/", removeReview);

export const reviewRoutes = router;
