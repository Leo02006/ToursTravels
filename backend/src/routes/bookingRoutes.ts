import express from 'express';
import { protect } from '../middleware/auth';
import { getBookings, createBooking, checkBookingStatus, cancelBooking } from '../controllers/bookingController';

const router = express.Router();

router.route('/')
    .get(protect as any, getBookings as any)
    .post(protect as any, createBooking as any);

router.route('/status/:id')
    .get(checkBookingStatus as any);

router.route('/:id/cancel')
    .put(protect as any, cancelBooking as any);

export default router;
