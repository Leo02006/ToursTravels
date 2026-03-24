import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Booking, TourPackage, CompanyProfile } from '../models';

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        let bookings: any[] = [];

        if (req.user.role === 'CUSTOMER') {
            const rawBookings = await Booking.find({ userId: req.user._id })
                .populate({
                    path: 'packageId',
                    populate: { path: 'companyId' }
                })
                .sort({ createdAt: -1 })
                .lean();

            bookings = rawBookings.map((b: any) => ({
                ...b,
                id: b._id,
                tourPackage: b.packageId ? {
                    ...b.packageId,
                    id: b.packageId._id,
                    company: b.packageId.companyId ? { ...b.packageId.companyId, id: b.packageId.companyId._id } : null
                } : null
            }));

        } else if (req.user.role === 'COMPANY') {
            const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });

            if (companyProfile) {
                // Find all packages owned by this company
                const companyPackages = await TourPackage.find({ companyId: companyProfile._id }).select('_id');
                const packageIds = companyPackages.map(p => p._id);

                const rawBookings = await Booking.find({ packageId: { $in: packageIds } })
                    .populate('packageId')
                    .populate('userId', 'name email')
                    .sort({ createdAt: -1 })
                    .lean();

                bookings = rawBookings.map((b: any) => ({
                    ...b,
                    id: b._id,
                    tourPackage: b.packageId ? { ...b.packageId, id: b.packageId._id } : null,
                    user: b.userId ? { ...b.userId, id: b.userId._id } : null
                }));
            }
        } else if (req.user.role === 'ADMIN') {
            const rawBookings = await Booking.find()
                .populate({
                    path: 'packageId',
                    populate: { path: 'companyId' }
                })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .lean();

            bookings = rawBookings.map((b: any) => ({
                ...b,
                id: b._id,
                tourPackage: b.packageId ? {
                    ...b.packageId,
                    id: b.packageId._id,
                    company: b.packageId.companyId ? { ...b.packageId.companyId, id: b.packageId.companyId._id } : null
                } : null,
                user: b.userId ? { ...b.userId, id: b.userId._id } : null
            }));
        }

        res.json(bookings);
    } catch (error) {
        console.error('Fetch bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'CUSTOMER') {
            res.status(403).json({ error: 'Only customers can book' });
            return;
        }

        const { packageId, participants } = req.body;
        const pkg = await TourPackage.findById(packageId);

        if (!pkg) {
            res.status(404).json({ error: 'Package not found' });
            return;
        }
        if (pkg.approvalStatus !== 'APPROVED') {
            res.status(400).json({ error: 'Package unavailable' });
            return;
        }
        if (pkg.slots < participants) {
            res.status(400).json({ error: 'Not enough slots' });
            return;
        }

        const totalAmount = (pkg.price - pkg.discount) * participants;

        // Create booking and decrement slots
        const booking = await Booking.create({
            userId: req.user._id,
            packageId,
            participants,
            totalAmount,
            status: 'CONFIRMED',
            paymentStatus: 'COMPLETED' // Simplified for MVP
        });

        await TourPackage.findByIdAndUpdate(packageId, { $inc: { slots: -participants } });

        res.status(201).json({ ...booking.toObject(), id: booking._id });
    } catch (error: any) {
        console.error('Booking error FULL:', error);
        res.status(500).json({ error: error?.message || 'Internal server error' });
    }
};

export const checkBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('packageId');
        
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        res.json({ status: booking.status, details: booking });
    } catch (error) {
        console.error('Check booking status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'CUSTOMER') {
            res.status(403).json({ error: 'Only customers can cancel bookings' });
            return;
        }

        const { id } = req.params;
        const booking = await Booking.findOne({ _id: id, userId: req.user._id });

        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }

        if (booking.status === 'CANCELLED') {
            res.status(400).json({ error: 'Booking is already cancelled' });
            return;
        }

        booking.status = 'CANCELLED';
        booking.paymentStatus = 'REFUNDED'; // Simulated refund processing
        await booking.save();

        // Re-add slots
        if (booking.packageId && booking.participants) {
            await TourPackage.findByIdAndUpdate(booking.packageId, { $inc: { slots: booking.participants } });
        }

        const refundDetails = {
            message: 'Booking cancelled successfully. Refund initiated.',
            refundAmount: booking.totalAmount * 0.8, // 80% refund standard policy
            cancellationFee: booking.totalAmount * 0.2
        };

        res.json({ booking, refundDetails });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
