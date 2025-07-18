import { Container, Typography, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminAddShowPage() {
  const [form, setForm] = useState({
    movieId: '',
    cinema: '',
    format: '',
    date: '',
    time: ''
  });
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/movies')
      .then(res => setMovies(res.data))
      .catch(err => console.error('Failed to load movies:', err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const seats = Array.from({ length: 30 }, (_, i) => ({
      seatNumber: `A${i + 1}`,
      isBooked: false
    }));

    try {
      await axios.post('http://localhost:5000/api/shows', { ...form, seats });
      alert('✅ Show added successfully!');
    } catch (err) {
      alert('❌ Failed to add show.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>➕ Add New Show</Typography>

      <TextField
        select
        label="Movie"
        name="movieId"
        fullWidth
        SelectProps={{ native: true }}
        value={form.movieId}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        <option value="">Select movie</option>
        {movies.map(movie => (
          <option key={movie._id} value={movie._id}>{movie.title}</option>
        ))}
      </TextField>

      <TextField name="cinema" label="Cinema" fullWidth onChange={handleChange} sx={{ mb: 2 }} />
      <TextField name="format" label="Format (e.g. 2D, IMAX)" fullWidth onChange={handleChange} sx={{ mb: 2 }} />
      <TextField name="date" type="date" fullWidth onChange={handleChange} sx={{ mb: 2 }} />
      <TextField name="time" type="time" fullWidth onChange={handleChange} sx={{ mb: 2 }} />

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Create Show with 30 Seats
      </Button>
    </Container>
  );
}
