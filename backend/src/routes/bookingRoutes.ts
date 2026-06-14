import express from 'express';
import { createBooking } from '../controllers/BookingControllers';
import { getUserBookings, cancelBooking } from '../controllers/BookingControllers';

const router = express.Router();

// When a POST request hits this route, run the createBooking function
router.post('/', createBooking);
router.get('/user/:userId', getUserBookings);
router.put('/:bookingId/cancel', cancelBooking);

export default router;