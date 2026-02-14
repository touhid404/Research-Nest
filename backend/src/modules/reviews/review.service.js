import Review from "../../models/review.model.js";
import User from "../../models/user.model.js";

// Get all approved reviews for landing page
export const getApprovedReviews = async (limit = 50) => {
    const reviews = await Review.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    
    // Fetch user data for each review
    const userUids = reviews.map(r => r.userUid);
    const users = await User.find({ uid: { $in: userUids } }).lean();
    const userMap = users.reduce((acc, user) => {
        acc[user.uid] = user;
        return acc;
    }, {});
    
    // Attach user data to reviews
    const reviewsWithUserData = reviews.map(review => {
        const user = userMap[review.userUid];
        return {
            ...review,
            userName: user?.name || "Anonymous",
            userPhoto: user?.photoURL || "https://api.dicebear.com/7.x/adventurer/png?seed=8",
            userRole: user?.occupation || "Researcher",
        };
    });
    
    return reviewsWithUserData;
};

// Get user's review
export const getUserReview = async (userUid) => {
    const review = await Review.findOne({ userUid });
    return review;
};

// Create or update review
export const createOrUpdateReview = async (userUid, reviewData) => {
    const existingReview = await Review.findOne({ userUid });
    
    if (existingReview) {
        // Update existing review
        existingReview.rating = reviewData.rating;
        existingReview.comment = reviewData.comment;
        await existingReview.save();
        return existingReview;
    }
    
    // Create new review
    const review = new Review({
        userUid,
        rating: reviewData.rating,
        comment: reviewData.comment,
    });
    await review.save();
    return review;
};

// Delete review
export const deleteReview = async (userUid) => {
    const result = await Review.findOneAndDelete({ userUid });
    return result;
};
