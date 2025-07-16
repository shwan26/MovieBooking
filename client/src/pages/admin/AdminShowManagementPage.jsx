import { Container, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { useState } from 'react';

const mockShows = [
  { id: 's1', movie: 'Inception', time: '14:00', screen: 'Screen 1' },
  { id: 's2', movie: 'Interstellar', time: '18:00', screen: 'Screen 2' }
];

export default function AdminShowManagementPage() {
  const [form, setForm] = useState({ movie: '', screen: '', time: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🕒 Manage Showtimes</Typography>
      <TextField fullWidth name="movie" label="Movie Title" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="screen" label="Screen" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth name="time" label="Time (e.g., 19:00)" onChange={handleChange} sx={{ mb: 2 }} />
      <Button variant="contained" sx={{ mb: 4 }}>Add Showtime</Button>
      <List>
        {mockShows.map(show => (
          <ListItem key={show.id}>
            <ListItemText primary={`${show.movie} • ${show.screen} • ${show.time}`} />
            <Button size="small" color="error">Delete</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
