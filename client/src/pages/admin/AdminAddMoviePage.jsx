import { Container, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminAddMoviePage() {
  const [movie, setMovie] = useState({ title: '', genre: '', duration: '', description: '', posterUrl: '', trailerUrl: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await axios.post('http://localhost:5000/api/movies', {
      ...movie,
      duration: Number(movie.duration)
    });
    alert('✅ Movie added');
    navigate('/admin/movies');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Add New Movie</Typography>
      <TextField name="title" label="Title" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
      <TextField name="genre" label="Genre" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
      <TextField name="duration" label="Duration (minutes)" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
      <TextField name="description" label="Description" fullWidth multiline rows={2} sx={{ mb: 2 }} onChange={handleChange} />
      <TextField name="posterUrl" label="Poster URL" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
      <TextField name="trailerUrl" label="Trailer URL" fullWidth sx={{ mb: 2 }} onChange={handleChange} />
      <Button variant="contained" fullWidth onClick={handleSubmit}>Submit</Button>
    </Container>
  );
}
