import { Container, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function AdminAddMoviePage() {
  const [movie, setMovie] = useState({ title: '', genre: '', duration: '', posterUrl: '' });

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>➕ Add New Movie</Typography>
      <TextField fullWidth name="title" label="Title" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="genre" label="Genre" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="duration" label="Duration (mins)" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="posterUrl" label="Poster URL" onChange={handleChange} sx={{ mb: 2 }} />
      <Button variant="contained">Submit Movie</Button>
    </Container>
  );
}
