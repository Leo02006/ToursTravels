import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { User, CompanyProfile, TourPackage } from './models';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        console.log('Seeding admin user...');

        const existingAdmin = await User.findOne({ email: 'admin@leostours.com' });

        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = await User.create({
            name: 'Super Admin',
            email: 'admin@leostours.com',
            password: hashedPassword,
            role: 'ADMIN'
        });

        console.log('Admin user seeded successfully:');
        console.log(`Email: ${admin.email}`);
        console.log(`Role: ${admin.role}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
