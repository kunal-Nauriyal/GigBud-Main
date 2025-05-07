import Review from '../models/Review.js';
import { successResponse, errorResponse } from '../views/responseTemplates.js';

// 📌 Submit a Review
export const submitReview = async (req, res) => {
    try {
        const { rating, description } = req.body;
        const { userId } = req.params;
        const reviewerId = req.user.id; // Logged-in user

        if (!rating || !description) {
            return errorResponse(res, 'Rating and description are required', 400);
        }
        if (rating < 1 || rating > 5) {
            return errorResponse(res, 'Rating must be between 1 and 5', 400);
        }

        const newReview = new Review({ user: userId, reviewer: reviewerId, rating, description });
        await newReview.save();

        return successResponse(res, 'Review submitted successfully', 201, newReview);
    } catch (error) {
        return errorResponse(res, 'Server error', 500);
    }
};

// 📌 Fetch User Reviews
export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await Review.find({ user: userId }).populate('reviewer', 'name email');

        return successResponse(res, 'User reviews fetched successfully', 200, reviews);
    } catch (error) {
        return errorResponse(res, 'Server error', 500);
    }
};
