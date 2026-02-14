/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import { reviewApi } from "../../lib/reviewApi";
import toast from "react-hot-toast";

const ReviewModal = ({ isOpen, onClose, existingReview = null }) => {
    const [rating, setRating] = useState(existingReview?.rating || 5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(existingReview?.comment || "");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        } else {
            setRating(5);
            setComment("");
        }
    }, [existingReview, isOpen]);

    const handleSubmit = async () => {
        // Check if user is logged in
        const uid = localStorage.getItem("uid");
        if (!uid) {
            toast.error("Please log in to submit a review");
            return;
        }

        if (!comment.trim()) {
            toast.error("Please write a review");
            return;
        }

        if (comment.length > 300) {
            toast.error("Review must be 300 characters or less");
            return;
        }

        setIsLoading(true);
        try {
            const response = await reviewApi.submitReview(rating, comment.trim());
            console.log("Review submitted:", response);
            toast.success(existingReview ? "Review updated!" : "Thank you for your review!");
            onClose();
        } catch (error) {
            console.error("Error submitting review:", error);
            const errorMessage = error.response?.data?.message || "Failed to submit review";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-white/20 dark:border-slate-800"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <IoCloseOutline className="w-5 h-5 text-slate-400" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {existingReview ? "Update Your Review" : "Share Your Experience"}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Help others by sharing your feedback about Research Nest
                            </p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    disabled={isLoading}
                                    className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                                >
                                    <FaStar
                                        className={`w-8 h-8 transition-colors ${
                                            (hoverRating || rating) >= star
                                                ? "text-amber-400"
                                                : "text-slate-200 dark:text-slate-700"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Comment */}
                        <div className="mb-6">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your review here..."
                                disabled={isLoading}
                                maxLength={300}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none disabled:opacity-50"
                            />
                            <p className="text-right text-xs text-slate-400 mt-1">
                                {comment.length}/300
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !comment.trim()}
                                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-violet-600 shadow-lg shadow-violet-500/25 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    existingReview ? "Update Review" : "Submit Review"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;

    return createPortal(modalContent, document.body);
};

export default ReviewModal;
