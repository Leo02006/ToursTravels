import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Review, Booking, TourPackage } from '../models';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'CUSTOMER') {
            res.status(403).json({ error: 'Only customers can leave reviews' });
            return;
        }

        const { packageId, rating, comment } = req.body;

        // Check if they actually booked and COMPLETED this tour
        const booking = await Booking.findOne({ 
            userId: req.user._id, 
            packageId, 
            status: 'CONFIRMED' 
        });

        if (!booking) {
            res.status(400).json({ error: 'You can only review packages you have booked and confirmed' });
            return;
        }

        // Check if they already reviewed
        const existingReview = await Review.findOne({ userId: req.user._id, packageId });
        if (existingReview) {
            res.status(400).json({ error: 'You have already reviewed this package' });
            return;
        }

        const review = await Review.create({
            userId: req.user._id,
            packageId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPackageReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { packageId } = req.params;
        const reviews = await Review.find({ packageId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
