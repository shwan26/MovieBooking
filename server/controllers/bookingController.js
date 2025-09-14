// server/controllers/bookingController.js
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

const PRICES = { normal: 250, honeymoon: 400 };
const ADDON_PRICES = { popcorn: 100, cola: 20 };

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

// POST /api/bookings  (create PENDING booking, do NOT mark seats)
export const createBooking = async (req, res) => {
  try {
    const { showId, seats, seatTypeMap } = req.body;
    if (!showId || !Array.isArray(seats) || !seats.length) {
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

    // Don't mark seats yet. Just record the request.
    const booking = await Booking.create({
      showId,
      seats,
      status: 'pending',
      seatTypeMap: seatTypeMap || undefined, // keep client map; server will validate again
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/bookings/:id/confirm
// body: { contact: { email, phone, membershipCard?, couponId? }, addOns: { popcorn, cola } }
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { contact, addOns } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'confirmed') {
      return res.json({ message: 'Already confirmed', booking });
    }

    const show = await Show.findById(booking.showId);
    if (!show) return res.status(404).json({ error: 'Show not found' });

    // Validate availability right now
    const conflicts = booking.seats.filter(seat =>
      show.seats.find(s => s.seatNumber === seat && s.isBooked)
    );
    if (conflicts.length) {
      return res.status(409).json({ error: `Seats already booked: ${conflicts.join(', ')}` });
    }

    // Server-side seat type map (prefer show.seatTypeMap)
    const serverSeatTypeMap = show.seatTypeMap || booking.seatTypeMap || {};
    const counts = booking.seats.reduce(
      (acc, seat) => {
        const t = serverSeatTypeMap[seat] === 'honeymoon' ? 'honeymoon' : 'normal';
        acc[t] += 1;
        return acc;
      },
      { normal: 0, honeymoon: 0 }
    );

    // Pricing
    const seatSubtotal = counts.normal * PRICES.normal + counts.honeymoon * PRICES.honeymoon;
    const popcorn = Math.max(0, Number(addOns?.popcorn || 0));
    const cola = Math.max(0, Number(addOns?.cola || 0));
    const addonSubtotal = popcorn * ADDON_PRICES.popcorn + cola * ADDON_PRICES.cola;
    const discount = booking.seats.length === 4 ? 100 : 0;
    const total = Math.max(0, seatSubtotal + addonSubtotal - discount);

    // Mark seats as booked now (atomic save)
    show.seats = show.seats.map(seat =>
      booking.seats.includes(seat.seatNumber)
        ? { ...seat.toObject?.() ?? seat, isBooked: true }
        : seat
    );
    await show.save();

    // Update booking
    booking.status = 'confirmed';
    booking.totalAmount = total;
    booking.pricing = {
      counts,
      seatSubtotal,
      addonSubtotal,
      discount,
      addOns: { popcorn, cola, prices: ADDON_PRICES }
    };
    booking.contact = {
      email: contact?.email || '',
      phone: contact?.phone || '',
      membershipCard: contact?.membershipCard || null,
      couponId: contact?.couponId || null,
    };

    await booking.save();

    res.json({ message: 'Booking confirmed', booking });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
