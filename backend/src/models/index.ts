import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'COMPANY', 'ADMIN'], default: 'CUSTOMER' },
}, { timestamps: true });

const companyProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true },
    contactDetails: { type: String },
    approvalStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' }
}, { timestamps: true });

const tourPackageSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    currency: { type: String, enum: ['USD', 'INR', 'EUR', 'GBP'], default: 'USD' },
    discount: { type: Number, default: 0 },
    slots: { type: Number, required: true },
    itinerary: { type: String },
    inclusions: { type: String },
    exclusions: { type: String },
    theme: { type: String },
    availableDates: [{ type: String }],
    imageUrl: { type: String },
    approvalStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage', required: true },
    bookingDate: { type: String },
    participants: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
    paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'REFUNDED'], default: 'PENDING' }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage', required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    adminResponse: { type: String }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const CompanyProfile = mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', companyProfileSchema);
export const TourPackage = mongoose.models.TourPackage || mongoose.model('TourPackage', tourPackageSchema);
export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
