import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TourPackage, CompanyProfile, Review } from '../models';

export const getPackages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { companyId, status, destination, minPrice, maxPrice, theme, duration } = req.query;

        // Parse query constraints
        let whereClause: any = { approvalStatus: 'APPROVED' };

        if (req.user) {
            if (req.user.role === 'ADMIN') {
                // Admin sees everything by default unless filtered
                whereClause = {};
                if (status) whereClause.approvalStatus = status;
            } else if (req.user.role === 'COMPANY') {
                const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });
                if (companyProfile) {
                    // Company sees all their own packages, but only APPROVED public packages
                    whereClause = {
                        $or: [
                            { approvalStatus: 'APPROVED' },
                            { companyId: companyProfile._id }
                        ]
                    };
                }
            }
        }

        // Advanced Search Filters
        if (companyId) whereClause.companyId = companyId;
        if (destination) whereClause.destination = { $regex: destination, $options: 'i' };
        if (theme) whereClause.theme = { $regex: theme, $options: 'i' };
        if (duration) whereClause.duration = Number(duration);
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price.$gte = Number(minPrice);
            if (maxPrice) whereClause.price.$lte = Number(maxPrice);
        }

        const packages = await TourPackage.find(whereClause)
            .populate('companyId') // Gets CompanyProfile details
            .sort({ createdAt: -1 })
            .lean();

        const packagesWithRelations = await Promise.all(packages.map(async (pkg: any) => {
            const reviews = await Review.find({ packageId: pkg._id }).lean();
            return {
                ...pkg,
                id: pkg._id,
                company: pkg.companyId ? { ...pkg.companyId, id: pkg.companyId._id } : null,
                reviews: reviews.map((r: any) => ({ ...r, id: r._id }))
            };
        }));

        res.json(packagesWithRelations);
    } catch (error) {
        console.error('Fetch packages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createPackage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'COMPANY') {
            res.status(403).json({ error: 'Only companies can create packages' });
            return;
        }

        const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });
        if (!companyProfile) {
            res.status(400).json({ error: 'Company profile not found' });
            return;
        }

        const newPackage = await TourPackage.create({
            ...req.body,
            companyId: companyProfile._id,
            approvalStatus: 'PENDING'
        });

        res.status(201).json({ ...newPackage.toObject(), id: newPackage._id });
    } catch (error) {
        console.error('Create package error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updatePackage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const data = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const existingPackage = await TourPackage.findById(packageId);
        if (!existingPackage) {
            res.status(404).json({ error: 'Package not found' });
            return;
        }

        // If Admin, they can update approvalStatus (or whatever they want really)
        if (req.user.role === 'ADMIN') {
            const updated = await TourPackage.findByIdAndUpdate(
                packageId,
                { approvalStatus: data.approvalStatus },
                { new: true }
            );
            res.json({ ...updated?.toObject(), id: updated?._id });
            return;
        }

        // If it's a company, verify they own it
        const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });
        if (req.user.role === 'COMPANY' && companyProfile && companyProfile._id.toString() === existingPackage.companyId.toString()) {
            const updated = await TourPackage.findByIdAndUpdate(
                packageId,
                {
                    title: data.title,
                    destination: data.destination,
                    duration: data.duration,
                    price: data.price,
                    currency: data.currency,
                    slots: data.slots,
                    itinerary: data.itinerary,
                    inclusions: data.inclusions,
                    imageUrl: data.imageUrl,
                    theme: data.theme,
                    availableDates: data.availableDates,
                    approvalStatus: 'PENDING', // Reset: admin must re-approve after any edit
                },
                { new: true }
            );
            res.json({ ...updated?.toObject(), id: updated?._id });
            return;
        }

        res.status(403).json({ error: 'Forbidden' });
    } catch (error) {
        console.error('Update package error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deletePackage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const existingPackage = await TourPackage.findById(packageId);
        if (!existingPackage) {
            res.status(404).json({ error: 'Package not found' });
            return;
        }

        let canDelete = false;

        if (req.user.role === 'ADMIN') {
            canDelete = true;
        } else if (req.user.role === 'COMPANY') {
            const companyProfile = await CompanyProfile.findOne({ userId: req.user._id });
            if (companyProfile && companyProfile._id.toString() === existingPackage.companyId.toString()) {
                canDelete = true;
            }
        }

        if (canDelete) {
            await TourPackage.findByIdAndDelete(packageId);
            res.json({ message: 'Deleted' });
            return;
        }

        res.status(403).json({ error: 'Forbidden' });
    } catch (error) {
        console.error('Delete package error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
