import express from 'express';
import { getCompanies, updateCompanyStatus, getUsers, deleteUser, getReviews, respondToReview } from '../controllers/adminController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.use(protect, admin);

router.get('/companies', getCompanies);
router.put('/companies/:id', updateCompanyStatus);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/reviews', getReviews);
router.put('/reviews/:id/respond', respondToReview);

export default router;
