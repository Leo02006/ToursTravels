import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: 'c:/ToursTravels/backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tpms';

async function diagnose() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const TourPackage = mongoose.model('TourPackage', new mongoose.Schema({
            title: String,
            imageUrl: String
        }));

        const packages = await TourPackage.find({ imageUrl: { $ne: null, $ne: '' } });
        console.log(`Found ${packages.length} packages with images.`);

        const uploadDir = 'c:/ToursTravels/backend/uploads';
        
        for (const pkg of packages) {
            console.log(`\nPackage: ${pkg.title}`);
            console.log(`Stored URL: ${pkg.imageUrl}`);
            
            const filename = pkg.imageUrl.split('/').pop();
            const filePath = path.join(uploadDir, filename);
            
            if (fs.existsSync(filePath)) {
                console.log(`[OK] File exists: ${filePath}`);
            } else {
                console.log(`[ER] File NOT found: ${filePath}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Diagnosis failed:', error);
        process.exit(1);
    }
}

diagnose();
