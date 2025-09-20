// test/booking.cutoff.test.js
import { describe, test, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import './setup.js';
import request from 'supertest';
import app from '../app.js';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';

describe('POST /api/bookings (cutoff)', () => {
  test('rejects bookings within 10 minutes of showtime', async () => {
    const now = new Date('2025-01-01T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const movie = await Movie.create({ title: 'Arrival', duration: 116 });

    const show = await Show.create({
      movieId: movie._id,
      theatre: 3,
      format: 'TH Dub',
      ageRating: 'U',
      date: '2025-01-01',
      time: '12:05',        // 5 minutes after now -> should be blocked
      endTime: '14:05',
      seats: [{ seatNumber: 'A1' }, { seatNumber: 'A2' }],
    });

    const res = await request(app)
      .post('/api/bookings')
      .send({
        showId: show._id.toString(),
        seats: ['A1'],
        seatTypeMap: { A1: 'normal' },
      });

    // status may be 400 or 403 depending on your controller choice
    expect([400, 403]).toContain(res.status);

    // accept either "cutoff" or "too late"
    const msg = String(res.body?.error ?? res.text ?? '');
    expect(msg).toMatch(/(cutoff|too late)/i);


    vi.useRealTimers();
  }, 20000);
});
