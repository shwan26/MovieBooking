import express from 'express';
import { getMovies, createMovie, deleteMovie } from '../controllers/movieController.js';

const router = express.Router();

router.get('/', getMovies);
router.post('/', createMovie);
router.delete('/:id', deleteMovie);
router.get('/:id', getMovieById);

export default router;
