import { Container, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminAddMoviePage() {
  const [movie, setMovie] = useState({
    title: '',
    genre: '',
    duration: '',
    description: '',
    posterUrl: '',
    trailerUrl: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/movies', {
        ...movie,
        duration: Number(movie.duration)
      });
      alert('✅ Movie added!');
      navigate('/admin/movies');
    } catch (err) {
      alert('❌ Failed to add movie.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>➕ Add New Movie</Typography>
      <TextField fullWidth name="title" label="Title" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="genre" label="Genre" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="duration" label="Duration (mins)" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="description" label="Description" multiline rows={2} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="posterUrl" label="Poster URL" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="trailerUrl" label="Trailer URL" onChange={handleChange} sx={{ mb: 2 }} />
      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Submit Movie
      </Button>
    </Container>
  );
}
