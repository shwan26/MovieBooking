import Booking from '../models/Booking.js';

export const cancelBooking = async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate('showId');
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const now = new Date();
  const showTime = new Date(`${booking.showId.date}T${booking.showId.time}`);

  if (now > new Date(showTime.getTime() - 2 * 60 * 60000))
    return res.status(403).json({ error: 'Refund period expired' });

  const refund = booking.totalAmount * 0.5;
  res.status(200).json({ refund });
};
