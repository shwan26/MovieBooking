import express from 'express';
import { getShowById, bookSeats, createShow, getAllShows } from '../controllers/showController.js';

const router = express.Router();

router.get('/all', getAllShows);
router.get('/:id', getShowById);
router.post('/book', bookSeats);
router.post('/', createShow);

export default router;
