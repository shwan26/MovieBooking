import { describe, it, test, expect, vi } from 'vitest';

import axios from 'axios';
import { fetchMovies, addMovie } from '../movieApi';

vi.mock('axios');

describe('movieApi', () => {
  test('fetchMovies calls GET /api/movies', async () => {
    axios.get.mockResolvedValue({ data: [{ title: 'Interstellar' }] });
    const res = await fetchMovies();
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/movies');
    expect(res.data[0].title).toBe('Interstellar');
  });

  test('addMovie calls POST /api/movies', async () => {
    const payload = { title: 'Dune' };
    axios.post.mockResolvedValue({ data: { ...payload, _id: '123' } });
    const res = await addMovie(payload);
    expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/movies', payload);
    expect(res.data._id).toBe('123');
  });
});
