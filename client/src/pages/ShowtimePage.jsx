import {
  Container, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid
} from '@mui/material';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const mockShowtimes = [
  {
    showId: 's1',
    movieId: '1',
    cinema: 'Paragon Cineplex',
    format: '2D',
    date: '2025-07-20',
    time: '14:00'
  },
  {
    showId: 's2',
    movieId: '1',
    cinema: 'Major Ratchayothin',
    format: '4DX',
    date: '2025-07-20',
    time: '18:00'
  },
  {
    showId: 's3',
    movieId: '2',
    cinema: 'SF CentralWorld',
    format: 'IMAX',
    date: '2025-07-21',
    time: '20:00'
  }
];

export default function ShowtimePage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [selectedShowId, setSelectedShowId] = useState('');

  const shows = mockShowtimes.filter((s) => s.movieId === movieId);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Select a Showtime</Typography>

      {shows.length === 0 && (
        <Typography>No showtimes available for this movie.</Typography>
      )}

      {shows.length > 0 && (
        <Grid container spacing={3}>
          {shows.map((show) => (
            <Grid item xs={12} sm={6} md={4} key={show.showId}>
              <Button
                fullWidth
                variant={selectedShowId === show.showId ? 'contained' : 'outlined'}
                onClick={() => setSelectedShowId(show.showId)}
              >
                <Typography>
                  🎥 {show.cinema}<br />
                  {show.format} • {show.date} at {show.time}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        sx={{ mt: 4 }}
        disabled={!selectedShowId}
        variant="contained"
        onClick={() => navigate(`/show/${selectedShowId}/seats`)}
      >
        Continue to Seat Selection
      </Button>
    </Container>
  );
}
