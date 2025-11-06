// src/components/__tests__/MovieDetail.dataflow.test.jsx
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MovieDetail from '../../pages/MovieDetailsPage.jsx';
import { describe, it, afterEach, vi, expect } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const sample = {_id: 'm1', title: 'Inception', genre: 'Sci-Fi', duration: 148, posterUrl: '/inception.jpg',
  trailerUrl: 'https://trailers.example/inception',
};

function renderAt(path = '/movie/m1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MovieDetail (Data Flow)', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.open && (window.open = originalOpen);
  });

  const originalOpen = window.open;

  it('Load Movie (success): renders details (Definition → Usage)', async () => {
    axios.get.mockResolvedValueOnce({ data: sample });
    renderAt();

    expect(await screen.findByText(/Inception/i)).toBeInTheDocument();
    expect(screen.getByText(/Sci-Fi/i)).toBeInTheDocument();
    expect(screen.getByText(/148\s*mins/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Inception/i })).toHaveAttribute('src', '/inception.jpg');
  });

  it('Load Movie (not found): shows error and stops actions', async () => {
    axios.get.mockResolvedValueOnce({ data: null });
    renderAt();

    expect(await screen.findByText(/Movie not found/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /watch trailer/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /book now/i })).toBeNull();
  });

  it('Watch Trailer: opens trailer URL when clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: sample });
    window.open = vi.fn();
    renderAt();

    const link = await screen.findByRole('link', { name: /watch trailer/i }).catch(() => null);
    if (link) {
      expect(link).toHaveAttribute('href', sample.trailerUrl);
    } else {
      const btn = await screen.findByRole('button', { name: /watch trailer/i });
      await userEvent.click(btn);
      expect(window.open).toHaveBeenCalledWith(sample.trailerUrl, '_blank');
    }
  });

  it('Book Now: navigates to /movie/:id/showtime', async () => {
    axios.get.mockResolvedValueOnce({ data: sample });
    renderAt();

    const bookLink = await screen.findByRole('link', { name: /book now/i });
    expect(bookLink).toHaveAttribute('href', `/movie/${sample._id}/showtime`);
  });
});
