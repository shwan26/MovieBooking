import request from 'supertest';
import app from '../app.js';
import Movie from '../models/Movie.js';
import { describe, test, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import './setup.js';

describe('GET /api/movies', () => {
  test('returns all movies from db', async () => {
    await Movie.create([
      { title: 'Interstellar', duration: 169 },
      { title: 'Dune', duration: 155 }
    ]);

    const res = await request(app).get('/api/movies').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map(m => m.title)).toEqual(expect.arrayContaining(['Interstellar', 'Dune']));
  });
});
