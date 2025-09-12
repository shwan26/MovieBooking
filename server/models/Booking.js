import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: { type: [String], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  contact: {
    name: String,
    email: String,
    phone: String
  },
  movieTitle: String,
  cinema: String,
  date: String,
  time: String,
  bookedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);
