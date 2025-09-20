// src/components/_tests_/Homepage.test.jsx
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage.jsx';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock axios the Vitest way
vi.mock('axios');

const sampleMovies = [
  {
    _id: 'm1',
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    posterUrl: 'https://example.com/inception.jpg',
  },
];

describe('HomePage', () => {
  beforeEach(() => {
    // resolve the GET call your component makes in useEffect
    axios.get.mockResolvedValue({ data: sampleMovies });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renders movies returned by the API', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Because fetch happens in useEffect, wait for the DOM to update
    expect(await screen.findByText('Inception')).toBeInTheDocument();
    expect(screen.getByText(/Sci-Fi/i)).toBeInTheDocument();
    expect(screen.getByText(/148 mins/i)).toBeInTheDocument();
  });

  it('links the button to the correct details page', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const detailsLink = await screen.findByRole('link', { name: /view details/i });
    expect(detailsLink).toHaveAttribute('href', '/movie/m1');
  });
});
