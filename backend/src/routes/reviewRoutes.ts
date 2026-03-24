import express from 'express';
import { protect, optionalProtect } from '../middleware/auth';
import { createReview, getPackageReviews } from '../controllers/reviewController';

const router = express.Router();

router.route('/')
    .post(protect as any, createReview as any);

router.route('/package/:packageId')
    .get(optionalProtect as any, getPackageReviews as any);

export default router;
