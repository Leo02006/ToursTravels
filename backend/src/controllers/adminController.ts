import { Request, Response } from 'express';
import { User, CompanyProfile, Review, TourPackage, Booking } from '../models';

export const getCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
        const companies = await CompanyProfile.find().populate('userId', 'name email createdAt').sort({ createdAt: -1 });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
};

export const updateCompanyStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { approvalStatus } = req.body;
        
        const company = await CompanyProfile.findByIdAndUpdate(id, { approvalStatus }, { new: true });
        if (!company) {
            res.status(404).json({ error: 'Company not found' });
            return;
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ error: 'Status update failed' });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({ role: 'CUSTOMER' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        // Also delete their bookings or profile if needed; but for simple SRS compliance, just the user
        await Booking.deleteMany({ userId: id });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'name email')
            .populate('packageId', 'title companyId')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

export const respondToReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { adminResponse } = req.body;
        const review = await Review.findByIdAndUpdate(id, { adminResponse }, { new: true });
        if (!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: 'Failed to respond to review' });
    }
};
