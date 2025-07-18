import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

export const createBooking = async (req, res) => {
  try {
    const { userId, showId, selectedSeats, seatTypeMap, isMember, userAge, promoCode } = req.body;
    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ error: 'Show not found' });

    const conflicts = selectedSeats.filter(seat =>
      show.seats.find(s => s.seatNumber === seat && s.isBooked)
    );
    if (conflicts.length > 0) return res.status(400).json({ error: `Seats already booked: ${conflicts.join(', ')}` });

    const today = new Date().toISOString().split('T')[0];
    const userBookings = await Booking.find({ userId, bookedAt: { $regex: `^${today}` } });
    if (userBookings.length >= 5) return res.status(403).json({ error: 'Booking limit reached (5/day)' });

    const bookedCount = show.seats.filter(s => s.isBooked).length;
    const totalCapacity = show.seats.length;
    if (bookedCount + selectedSeats.length > totalCapacity)
      return res.status(400).json({ error: 'Show is full' });

    let total = 0;
    for (let seat of selectedSeats) {
      const type = seatTypeMap[seat] || 'normal';
      total += type === 'honeymoon' ? 250 : 150;
    }

    if (isMember) total *= 0.9;
    if (promoCode === 'B4G1') {
      const free = Math.floor(selectedSeats.length / 5);
      total -= free * 150;
    }
    if (userAge < 12) total *= 0.8;
    if (userAge > 60) total *= 0.85;

    const now = new Date();
    const showTime = new Date(`${show.date}T${show.time}`);
    if (now > new Date(showTime.getTime() - 10 * 60000))
      return res.status(403).json({ error: 'Too late to book' });

    show.seats = show.seats.map(seat =>
      selectedSeats.includes(seat.seatNumber)
        ? { ...seat.toObject(), isBooked: true }
        : seat
    );
    await show.save();

    const booking = new Booking({ showId, userId, seats: selectedSeats, totalAmount: total });
    await booking.save();

    res.status(201).json({ message: 'Booking successful', booking });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
