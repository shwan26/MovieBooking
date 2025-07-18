import express from 'express';
import { cancelBooking } from '../controllers/cancelController.js';

const router = express.Router();

router.post('/', cancelBooking); // checks refund eligibility and returns refund amount

export default router;
