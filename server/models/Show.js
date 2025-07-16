import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  isBooked: { type: Boolean, default: false }
});

const showSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  cinema: String,
  format: String,
  date: String,
  time: String,
  seats: [seatSchema]
});

export default mongoose.model('Show', showSchema);
