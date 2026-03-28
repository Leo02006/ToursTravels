import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.memoryStorage();

// Configure multer upload limits and file filtering
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif|avif|svg/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images Only!'));
        }
    }
});

// POST /api/upload
// Requires COMPANY or ADMIN role (handled by protect middleware context if needed, but simple protect is fine here)
router.post('/', protect as any, (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Convert file buffer to base64 Data URL to bypass ephemeral disk issues on Render
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${b64}`;

            res.status(200).json({
                message: 'File uploaded successfully',
                imageUrl
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'File upload failed' });
        }
    });
});

export default router;
