import Show from '../models/Show.js';

export const getAllShows = async (req, res) => {
  const shows = await Show.find();
  res.json(shows);
};

export const getShowById = async (req, res) => {
  const show = await Show.findById(req.params.id);
  if (!show) return res.status(404).json({ error: 'Show not found' });
  res.json(show);
};

export const createShow = async (req, res) => {
  const { movieId, cinema, date, time } = req.body;

  const shows = await Show.find({ cinema, date });
  const newStart = new Date(`${date}T${time}`);
  const newEnd = new Date(newStart.getTime() + 2 * 60 * 60000);

  const conflict = shows.find(s => {
    const start = new Date(`${s.date}T${s.time}`);
    const end = new Date(start.getTime() + 2 * 60 * 60000);
    return newStart < end && start < newEnd;
  });

  if (conflict) return res.status(400).json({ error: 'Showtime conflicts with existing show' });

  const seats = req.body.seats || Array.from({ length: 30 }, (_, i) => ({
    seatNumber: `A${i + 1}`,
    isBooked: false
  }));

  const show = new Show({ ...req.body, seats });
  await show.save();
  res.status(201).json(show);
};

export const bookSeats = async (req, res) => {
  const { showId, selectedSeats, user, seatTypeMap, isMember, userAge, promoCode } = req.body;
  const show = await Show.findById(showId);
  if (!show) return res.status(404).json({ error: 'Show not found' });

  const conflicts = selectedSeats.filter(seat =>
    show.seats.find(s => s.seatNumber === seat && s.isBooked)
  );
  if (conflicts.length > 0) return res.status(400).json({ error: `Seats already booked: ${conflicts.join(', ')}` });

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

  const Booking = (await import('../models/Booking.js')).default;
  const booking = new Booking({ showId, user, seats: selectedSeats, totalAmount: total });
  await booking.save();

  res.status(201).json({ message: 'Booking successful', booking });
};
