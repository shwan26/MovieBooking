import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

// GET /api/bookings/:id
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/bookings
// body: { showId, seats: string[] }
export const createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    if (!showId || !seats?.length) {
      return res.status(400).json({ error: 'showId and seats are required' });
    }

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ error: 'Show not found' });

    // cutoff 10 minutes before showtime
    const now = new Date();
    const showTime = new Date(`${show.date}T${show.time}`);
    if (now > new Date(showTime.getTime() - 10 * 60000)) {
      return res.status(403).json({ error: 'Too late to book' });
    }

    // check conflicts
    const conflicts = seats.filter(seat =>
      show.seats.find(s => s.seatNumber === seat && s.isBooked)
    );
    if (conflicts.length) {
      return res.status(400).json({ error: `Seats already booked: ${conflicts.join(', ')}` });
    }

    // mark seats as booked
    show.seats = show.seats.map(seat =>
      seats.includes(seat.seatNumber)
        ? { ...seat.toObject(), isBooked: true }
        : seat
    );
    await show.save();

    const pricePerSeat = show.price ?? 300;
    const total = pricePerSeat * seats.length;

    const booking = new Booking({
      showId,
      seats,
      totalAmount: total,
      movieTitle: show.movieTitle,
      cinema: show.cinema,
      date: show.date,
      time: show.time,
      status: 'pending'
    });
    await booking.save();

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/bookings/:id/contact
// body: { name, email, phone }
export const addContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { contact: { name, email, phone } },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Contact saved', booking });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// POST /api/bookings/:id/confirm
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'confirmed' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking confirmed', booking });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
