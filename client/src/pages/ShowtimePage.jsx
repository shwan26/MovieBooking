import {
  Container, Typography, Grid, Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ShowtimePage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/shows/all`)
      .then(res => {
        const filtered = res.data.filter(s => s.movieId === movieId);
        setShows(filtered);
      });
  }, [movieId]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Select Showtime</Typography>
      <Grid container spacing={3}>
        {shows.map(show => (
          <Grid item xs={12} sm={6} md={4} key={show._id}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(`/show/${show._id}/seats`)}
            >
              {show.cinema} • {show.format} • {show.date} @ {show.time}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
