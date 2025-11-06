// src/components/__tests__/HomePage.dataflow.test.jsx
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage.jsx';
import { describe, it, afterEach, vi, expect } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const moviesSample = [
  { _id: 'm1', title: 'Inception', genre: 'Sci-Fi', duration: 148, posterUrl: '/inception.jpg' },
];

describe('HomePage (Data Flow)', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Definition → Usage: loads movies and renders them', async () => {
    axios.get.mockResolvedValueOnce({ data: moviesSample });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Inception/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Inception/i })).toHaveAttribute('src', '/inception.jpg');
    expect(screen.getByText(/Sci-Fi/i)).toBeInTheDocument();
    expect(screen.getByText(/148\s*mins/i)).toBeInTheDocument();
    const detailsLink = screen.getByRole('link', { name: /view details/i });
    expect(detailsLink).toHaveAttribute('href', '/movie/m1');
  });

  it('Definition → Destruction branch: empty list renders no cards', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await screen.findByText(/Now Showing/i);
    expect(screen.queryAllByRole('img').length).toBe(0);
    expect(screen.queryByRole('link', { name: /view details/i })).toBeNull();
  });
});
