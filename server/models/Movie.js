import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: String,
  genre: String,
  duration: Number,
  description: String,
  posterUrl: String,
  trailerUrl: String
});

export default mongoose.model('Movie', movieSchema);
