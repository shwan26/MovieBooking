import express from 'express';
import { createBooking } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking); // handles: price, member, promo, seat map, cutoff etc.

export default router;
