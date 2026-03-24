import express from 'express';
import { protect, optionalProtect } from '../middleware/auth';
import { getPackages, createPackage, updatePackage, deletePackage } from '../controllers/packageController';

const router = express.Router();

router.route('/')
    .get(optionalProtect as any, getPackages as any)
    .post(protect as any, createPackage as any);

router.route('/:id')
    .put(protect as any, updatePackage as any)
    .delete(protect as any, deletePackage as any);

export default router;
