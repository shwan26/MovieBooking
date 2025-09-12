// controllers/showController.js
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';

/* ---------- Helpers ---------- */
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};

const toHHMM = (mins) => {
  const h = Math.floor((mins % (24 * 60)) / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Check if two intervals [s1,e1) and [s2,e2) overlap
const overlaps = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;

const buildSeats = (rows = 10, cols = 10) => {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const seatNumber = String.fromCharCode(65 + r) + c; // A1..J10
      seats.push({ seatNumber, isBooked: false });
    }
  }
  return seats;
};

/* ---------- CREATE SHOW ---------- */
export async function createShow(req, res) {
  try {
    const {
      movieId,
      theatre,
      format,
      originalLanguage,
      ageRating,
      date, // YYYY-MM-DD
      time, // HH:mm
      autoNext = false,
      cinema, // legacy support
    } = req.body;

    const theatreNum = theatre ?? (/^[1-8]$/.test(String(cinema)) ? Number(cinema) : undefined);

    if (!movieId) return res.status(400).json({ error: 'movieId is required.' });
    if (!(Number(theatreNum) >= 1 && Number(theatreNum) <= 8)) {
      return res.status(400).json({ error: 'theatre must be between 1 and 8.' });
    }
    if (!format) return res.status(400).json({ error: 'format is required.' });
    if (format === 'TH Sub (Original)' && !String(originalLanguage || '').trim()) {
      return res.status(400).json({ error: 'originalLanguage is required for TH Sub (Original).' });
    }
    if (!ageRating) return res.status(400).json({ error: 'ageRating is required.' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return res.status(400).json({ error: 'date must be YYYY-MM-DD.' });
    }
    if (!/^\d{2}:\d{2}$/.test(String(time))) {
      return res.status(400).json({ error: 'time must be HH:mm.' });
    }

    // Fetch movie runtime (duration in minutes)
    const movie = await Movie.findById(movieId).lean();
    if (!movie) return res.status(404).json({ error: 'Movie not found.' });
    if (!Number.isInteger(movie.duration) || movie.duration <= 0) {
      return res.status(400).json({ error: 'Movie duration must be a positive integer (minutes).' });
    }

    // Compute times
    const startMin = toMinutes(time);
    const endMin = startMin + movie.duration;
    const endWithBufferMin = endMin + 30;
    const endTime = toHHMM(endMin);

    // Check overlap in same theatre & date
    const sameDayShows = await Show.find({ theatre: theatreNum, date }).lean();
    const movieIds = [...new Set(sameDayShows.map(s => String(s.movieId)))];
    const movies = await Movie.find({ _id: { $in: movieIds } })
      .select('_id duration')
      .lean();
    const durationMap = new Map(movies.map(m => [String(m._id), m.duration]));

    for (const s of sameDayShows) {
      const sStart = toMinutes(s.time);
      const dur = durationMap.get(String(s.movieId)) || 0;
      const sEnd = sStart + dur;
      const sEndBuf = sEnd + 30;
      if (overlaps(startMin, endWithBufferMin, sStart, sEndBuf)) {
        return res.status(409).json({
          error: `Conflict with existing show in Theatre ${theatreNum} on ${date} (${s.time}–${toHHMM(sEnd)} +30m buffer).`,
        });
      }
    }

    const seats = buildSeats(10, 10);

    // Create main show
    const created = await Show.create({
      movieId,
      theatre: Number(theatreNum),
      format,
      originalLanguage: format === 'TH Sub (Original)' ? String(originalLanguage).trim() : undefined,
      ageRating,
      date,
      time,
      endTime,
      seats,
    });

    // Optional next show
    let nextShow = null;
    if (autoNext) {
      const nextStartMin = endWithBufferMin;
      const nextTime = toHHMM(nextStartMin);
      const nextEndMin = nextStartMin + movie.duration;
      const nextEndTime = toHHMM(nextEndMin);

      // Check overlap again
      for (const s of [...sameDayShows, created]) {
        const dur = durationMap.get(String(s.movieId)) || 0;
        const sStart = toMinutes(s.time);
        const sEnd = sStart + dur;
        const sEndBuf = sEnd + 30;
        if (overlaps(nextStartMin, nextEndMin + 30, sStart, sEndBuf)) {
          nextShow = { skipped: true, reason: 'Next show would overlap.' };
          break;
        }
      }

      if (!nextShow?.skipped) {
        nextShow = await Show.create({
          movieId,
          theatre: Number(theatreNum),
          format,
          originalLanguage: format === 'TH Sub (Original)' ? String(originalLanguage).trim() : undefined,
          ageRating,
          date,
          time: nextTime,
          endTime: toHHMM(nextEndMin),
          seats: buildSeats(10, 10),
        });
      }
    }

    return res.status(201).json({ show: created, nextShow });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ error: first?.message || 'Validation error.' });
    }
    console.error('createShow error:', err);
    res.status(500).json({ error: 'Server error creating show.' });
  }
}

/* ---------- READ ALL ---------- */
export async function getAllShows(_req, res) {
  try {
    const shows = await Show.find().lean();
    res.json(shows);
  } catch (err) {
    console.error('getAllShows error:', err);
    res.status(500).json({ error: 'Server error fetching shows.' });
  }
}

/* ---------- READ ONE ---------- */
export async function getShowById(req, res) {
  try {
    const show = await Show.findById(req.params.id).lean();
    if (!show) return res.status(404).json({ error: 'Show not found.' });
    res.json(show);
  } catch (err) {
    console.error('getShowById error:', err);
    res.status(500).json({ error: 'Server error fetching show.' });
  }
}

/* ---------- BOOK SEATS ---------- */
export async function bookSeats(req, res) {
  try {
    const { id } = req.params;
    const { seatNumbers } = req.body; // ["A1", "B2", ...]

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ error: 'seatNumbers must be a non-empty array.' });
    }

    const show = await Show.findById(id);
    if (!show) return res.status(404).json({ error: 'Show not found.' });

    const byNum = new Map(show.seats.map(s => [s.seatNumber, s]));
    const unavailable = [];

    for (const sn of seatNumbers) {
      const seat = byNum.get(sn);
      if (!seat || seat.isBooked) {
        unavailable.push(sn);
      }
    }

    if (unavailable.length) {
      return res.status(409).json({ error: `Seats unavailable: ${unavailable.join(', ')}` });
    }

    for (const sn of seatNumbers) {
      byNum.get(sn).isBooked = true;
    }
    await show.save();

    res.json({ ok: true, booked: seatNumbers });
  } catch (err) {
    console.error('bookSeats error:', err);
    res.status(500).json({ error: 'Server error booking seats.' });
  }
}
