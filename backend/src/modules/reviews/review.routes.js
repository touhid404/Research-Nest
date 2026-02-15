import express from "express";
import {
  getReviews,
  getMyReview,
  submitReview,
  removeReview,
} from "./review.controller.js";
import authCheck from "../../middleware/authCheck.js";

const router = express.Router();

// Public endpoint - get all approved reviews
router.get("/", getReviews);

// Protected endpoints - require user to be logged in
router.get("/my-review", authCheck(), getMyReview);
router.post("/", authCheck(), submitReview);
router.delete("/", authCheck(), removeReview);

export const reviewRoutes = router;
