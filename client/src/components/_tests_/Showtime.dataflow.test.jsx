// src/components/__tests__/Showtime.dataflow.test.jsx
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, afterEach, vi, expect } from 'vitest';
import axios from 'axios';
import ShowtimePage from '../../pages/ShowtimePage.jsx';

vi.mock('axios');

const shows = [
  { _id: 's1', movieId: 'm1', date: '2025-01-01', time: '18:00', theatre: 1, format: '2D', rating: 'G' },
  { _id: 's2', movieId: 'm1', date: '2025-01-01', time: '20:00', theatre: 2, format: '3D', rating: 'PG' },
  { _id: 's3', movieId: 'm1', date: '2025-01-02', time: '10:30', theatre: 1, format: '2D', rating: 'G' },
];

function renderAt(path = '/movie/m1/showtime') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/movie/:movieId/showtime" element={<ShowtimePage />} />
        <Route path="/show/:sid/seats" element={<div>SEAT PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ShowtimePage (Data Flow)', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Load Shows (success): date strip shows days', async () => {
    axios.get.mockResolvedValueOnce({ data: shows });

    renderAt();

    // Date strip renders seven day buttons containing weekday names (any locale)
    const dayButtons = await screen.findAllByRole('button', {
      name: /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i,
    });
    expect(dayButtons.length).toBeGreaterThanOrEqual(5); // usually 7
  });

  it('Date With No Shows: shows empty message and no time buttons', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    renderAt();

    expect(
      await screen.findByText(/No showtimes found for this date/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\b\d{1,2}:\d{2}\b/i })).toBeNull();
  });

  it('Date With Shows: grouped headers and showtimes render', async () => {
    axios.get.mockResolvedValueOnce({ data: shows });

    renderAt();

    // Component auto-selects first available date; groups should appear
    expect(await screen.findByText(/THEATRE\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/2D/i)).toBeInTheDocument();
    expect(screen.getByText(/THEATRE\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/3D/i)).toBeInTheDocument();

    // Times for the selected date
    expect(screen.getByRole('button', { name: /18:00/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /20:00/i })).toBeInTheDocument();
  });

  it('Choose a Showtime: clicking time navigates to /show/{show_id}/seats', async () => {
    axios.get.mockResolvedValueOnce({ data: shows });

    renderAt();

    // No date click required; first available date is selected
    await userEvent.click(await screen.findByRole('button', { name: /18:00/i }));
    expect(await screen.findByText(/SEAT PAGE/i)).toBeInTheDocument();
  });
});
