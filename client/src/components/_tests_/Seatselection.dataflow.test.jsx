// src/components/__tests__/Seatselection.dataflow.test.jsx
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, afterEach, vi, expect } from 'vitest';
import axios from 'axios';
import SeatSelectionPage from '../../pages/SeatSelectionPage.jsx';

vi.mock('axios');

function renderAt(path = '/show/s1/seats') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/show/:showId/seats" element={<SeatSelectionPage />} />
        <Route path="/payment/:bid" element={<div>PAYMENT PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const makeSeat = (id, isBooked = false) => ({ seatNumber: id, isBooked });
const baseShow = (o = {}) => ({
  _id: 's1',
  movieId: 'm1',
  date: '2025-01-01',
  time: '18:00',
  theatre: 1,
  format: '2D',
  movieTitle: 'Inception',
  seats: [],
  ...o,
});

// Helper: find <span aria-label="A1 • ..."> then click inner <button>
// If the button has pointer-events:none, pass {allowBlocked:true}.
async function clickSeat(id, { allowBlocked = false } = {}) {
  const span = await screen.findByLabelText(new RegExp(`^${id}\\b`, 'i'));
  const btn = span.querySelector('button');
  if (!btn) throw new Error(`Seat button for ${id} not found`);
  if (allowBlocked) {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await user.click(btn);
  } else {
    await userEvent.click(btn);
  }
}

describe('SeatSelectionPage (Data Flow)', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('1) Load Seats (none available): grid shows but cannot proceed', async () => {
    axios.get.mockResolvedValueOnce({
      data: baseShow({ seats: [makeSeat('A1', true), makeSeat('A2', true), makeSeat('A3', true)] }),
    });

    renderAt();

    // Attempting to click a booked seat should not add a chip (bypass CSS check)
    await clickSeat('A1', { allowBlocked: true });
    expect(screen.queryByText('A1')).toBeNull();

    const proceed = await screen.findByRole('button', { name: /continue to payment/i });
    expect(proceed).toBeDisabled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('2) Select Free Seat: seat added; total updates; proceed enabled', async () => {
    axios.get.mockResolvedValueOnce({
      data: baseShow({ seats: [makeSeat('A1', false), makeSeat('A2', true)] }),
    });

    renderAt();

    await clickSeat('A1');
    expect(await screen.findByText('A1')).toBeInTheDocument();
    expect(screen.getByText(/Total:\s*250\s*THB/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to payment/i })).not.toBeDisabled();
  });

  it('3) Select Booked Seat: ignored (no selection added)', async () => {
    axios.get.mockResolvedValueOnce({
      data: baseShow({ seats: [makeSeat('A1', false), makeSeat('A2', true)] }),
    });

    renderAt();

    // Try to click a booked seat; selection should not change
    await clickSeat('A2', { allowBlocked: true });
    expect(screen.queryByText('A2')).toBeNull();
  });

  it('4) Exceed Maximum Seats: shows error; keeps 4 selections', async () => {
    axios.get.mockResolvedValueOnce({
      data: baseShow({ seats: ['A1', 'A2', 'A3', 'A4', 'A5'].map((id) => makeSeat(id, false)) }),
    });

    renderAt();

    for (const id of ['A1', 'A2', 'A3', 'A4', 'A5']) {
      await clickSeat(id);
    }

    expect(await screen.findByText(/only book up to 4 seats/i)).toBeInTheDocument();
    expect(screen.getByText(/Total:\s*1000\s*THB/i)).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('A3')).toBeInTheDocument();
    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.queryByText('A5')).toBeNull();
  });

  it('5) Payment with 0 seats: proceed disabled; no POST', async () => {
    axios.get.mockResolvedValueOnce({
      data: baseShow({ seats: [makeSeat('A1', false)] }),
    });

    renderAt();

    const proceed = await screen.findByRole('button', { name: /continue to payment/i });
    expect(proceed).toBeDisabled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('7) Booking API Failure: POST returns no bookingId → show error; stay on page', async () => {
    axios.get.mockResolvedValueOnce({
      data: baseShow({ seats: [makeSeat('A1', false)] }),
    });
    axios.post.mockResolvedValueOnce({ data: {} });

    renderAt();

    await clickSeat('A1');
    await userEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
    expect(await screen.findByText(/No booking id returned|Booking failed/i)).toBeInTheDocument();
    expect(screen.queryByText(/PAYMENT PAGE/i)).toBeNull();
  });

  it('8) Successful Booking → Payment: navigates to /payment/{bookingId}', async () => {
    axios.get.mockResolvedValueOnce({
      data: baseShow({ seats: [makeSeat('A1', false)] }),
    });
    axios.post.mockResolvedValueOnce({ data: { booking: { _id: 'b123' } } });

    renderAt();

    await clickSeat('A1');
    await userEvent.click(screen.getByRole('button', { name: /continue to payment/i }));
    expect(await screen.findByText(/PAYMENT PAGE/i)).toBeInTheDocument();
  });
});
