// src/components/_tests_/Confirmation.dataflow.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import axios from 'axios';
import ConfirmationPage from '../../pages/ConfirmationPage.jsx';

// --- Mocks ---
vi.mock('axios');

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,abc')),
  },
}));

function Home() {
  return <h1>HOME</h1>;
}

function renderAt(path = '/confirmation/b1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
      </Routes>
    </MemoryRouter>
  );
}

// --- Fixtures ---
const booking = {
  _id: 'b1',
  showId: 's1',
  seats: ['A1', 'A2', 'J5', 'J6'], // 2 normal, 2 honeymoon
  seatTypeMap: { A1: 'normal', A2: 'normal', J5: 'honeymoon', J6: 'honeymoon' },
  contact: { email: 'a@b.com', phone: '0899999999', membershipCard: 'MEM-1', couponId: 'SAVE10' },
  totalAmount: 1200, // 2*250 + 2*400 - 100 flat discount
  status: 'CONFIRMED',
  createdAt: '2025-01-01T09:00:00.000Z',
};

const show = {
  _id: 's1',
  theatre: 1,
  format: '2D',
  date: '2025-01-01',
  time: '18:00',
  movieId: 'm1',
};

const movie = { _id: 'm1', title: 'Inception' };

// stub the 3 GETs the page performs (booking ➜ show ➜ movie)
async function stubLoadSuccess() {
  axios.get
    .mockResolvedValueOnce({ data: { booking } }) // /bookings/:id
    .mockResolvedValueOnce({ data: show })        // /shows/:id
    .mockResolvedValueOnce({ data: movie });      // /movies/:id
}

describe('ConfirmationPage (Data Flow)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.clearAllMocks());

  it('Load Booking (success): shows details, receipt block, and QR', async () => {
    await stubLoadSuccess();
    renderAt();

    // Wait for stable summary content
    await screen.findByText(/Total Paid:\s*1200 THB/i);

    // Movie & meta
    expect(screen.getByText(/Inception/i)).toBeInTheDocument();

    // Theatre
    expect(
    screen.getAllByText((_, el) => el?.textContent?.match(/Theatre:\s*1\b/i)).length
    ).toBeGreaterThan(0);

    // Format
    expect(
    screen.getAllByText((_, el) => el?.textContent?.match(/Format:\s*2D\b/i)).length
    ).toBeGreaterThan(0);

    // Date & Time
    expect(
    screen.getAllByText((_, el) =>
        el?.textContent?.match(/Date & Time:\s*2025-01-01\s*•\s*18:00/i)
    ).length
    ).toBeGreaterThan(0);


    // Seats chips (H/N tags)
    expect(screen.getByText(/A1 • N/i)).toBeInTheDocument();
    expect(screen.getByText(/A2 • N/i)).toBeInTheDocument();
    expect(screen.getByText(/J5 • H/i)).toBeInTheDocument();
    expect(screen.getByText(/J6 • H/i)).toBeInTheDocument();

    // Pricing breakdown and total
    expect(screen.getByText(/Normal x 2 @ 250 = 500 THB/i)).toBeInTheDocument();
    expect(screen.getByText(/Honeymoon x 2 @ 400 = 800 THB/i)).toBeInTheDocument();
    expect(screen.getByText(/Seats Subtotal:\s*1300 THB/i)).toBeInTheDocument();
    expect(screen.getByText(/Discount \(4 seats\):\s*−100 THB/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Paid:\s*1200 THB/i)).toBeInTheDocument();

    // QR section
    expect(screen.getByText(/Your Receipt QR/i)).toBeInTheDocument();
    const qrImg = screen.getByRole('img', { name: /receipt qr code/i });
    expect(qrImg).toHaveAttribute('src', expect.stringContaining('data:image/png;base64,abc'));
  });

  it('Load Booking (not found): shows error banner; no further actions', async () => {
    axios.get.mockResolvedValueOnce({ data: { booking: null } }); // bad payload
    renderAt();

    // Component shows its generic error banner on failure
    expect(await screen.findByText(/failed to load receipt/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /print/i })).toBeNull();
  });

  it('Go Home: clicking Home navigates to /', async () => {
    await stubLoadSuccess();
    renderAt();

    // Wait for a stable piece of content to ensure page is loaded
    await screen.findByText(/Total Paid:\s*1200 THB/i);

    await userEvent.click(screen.getByRole('button', { name: /^home$/i }));
    expect(await screen.findByText(/^HOME$/i)).toBeInTheDocument();
  });
});
