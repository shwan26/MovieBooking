import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show' },
  user: String, // for now, store just a name or email
  seats: [String],
  totalAmount: Number,
  bookedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);
