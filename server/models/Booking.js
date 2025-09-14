// server/models/Booking.js
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  seats: { type: [String], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },

  // 👇 make optional or give a default
  totalAmount: { type: Number, default: 0 }, // was: required: true

  // extras to support the new flow (optional but useful)
  seatTypeMap: { type: mongoose.Schema.Types.Mixed },
  pricing: { type: mongoose.Schema.Types.Mixed },          // server-calculated on confirm
  contact: {
    email: String,
    phone: String,
    membershipCard: String,
    couponId: String,
  },
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
