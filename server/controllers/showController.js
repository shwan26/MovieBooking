import Show from '../models/Show.js';

export const getShowById = async (req, res) => {
  const show = await Show.findById(req.params.id);
  if (!show) return res.status(404).json({ error: 'Show not found' });
  res.json(show);
};

export const createShow = async (req, res) => {
  try {
    const show = new Show(req.body);
    await show.save();
    res.status(201).json(show);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getAllShows = async (req, res) => {
  const shows = await Show.find();
  res.json(shows);
};


export const bookSeats = async (req, res) => {
  const { showId, selectedSeats, user } = req.body;
  const show = await Show.findById(showId);
  if (!show) return res.status(404).json({ error: 'Show not found' });

  // Check if seats are already booked
  const conflict = selectedSeats.find(seat =>
    show.seats.find(s => s.seatNumber === seat && s.isBooked)
  );
  if (conflict) return res.status(400).json({ error: `Seat ${conflict} already booked` });

  // Mark seats as booked
  show.seats = show.seats.map(seat =>
    selectedSeats.includes(seat.seatNumber)
      ? { ...seat.toObject(), isBooked: true }
      : seat
  );
  await show.save();

  // Save booking
  const total = selectedSeats.length * 150;
  const Booking = (await import('../models/Booking.js')).default;
  const booking = new Booking({ showId, seats: selectedSeats, totalAmount: total, user });
  await booking.save();

  res.status(201).json({ message: 'Booking confirmed', booking });
};
