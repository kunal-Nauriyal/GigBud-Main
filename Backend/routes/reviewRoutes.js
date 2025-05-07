import express from 'express';
import { submitReview, getUserReviews } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/review/:userId', authMiddleware, submitReview);
router.get('/reviews/:userId', authMiddleware, getUserReviews);

export default router;
