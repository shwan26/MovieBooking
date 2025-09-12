// server/routes/bookingRoutes.js
import express from 'express';
import {
  createBooking,
  addContact,
  confirmBooking,
  getBooking
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);                     // create pending booking (no contact)
router.get('/:id', getBooking);                      // fetch for payment page
router.patch('/:id/contact', addContact);            // add contact after booking
router.post('/:id/confirm', confirmBooking);         // confirm after payment

export default router;
