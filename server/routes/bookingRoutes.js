// server/routes/bookingRoutes.js
import express from 'express';
import {
  createBooking,
  getBooking,
  confirmBooking,
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);               // create pending booking
router.get('/:id', getBooking);                // fetch for payment page
router.post('/:id/confirm', confirmBooking);   // confirm + mark seats + finalize

export default router;
