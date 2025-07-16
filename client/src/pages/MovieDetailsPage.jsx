import { Container, Typography, Button, CircularProgress } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/movies/${movieId}`)
      .then(res => {
        setMovie(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading movie:', err);
        setLoading(false);
      });
  }, [movieId]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (!movie) return <Typography>❌ Movie not found</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{movie.title}</Typography>
      <img src={movie.posterUrl} alt={movie.title} width="300" style={{ marginBottom: 16 }} />
      <Typography variant="subtitle1" gutterBottom>{movie.genre} • {movie.duration} mins</Typography>
      <Typography variant="body1" paragraph>{movie.description}</Typography>
      <Button href={movie.trailerUrl} target="_blank" variant="outlined" sx={{ mr: 2 }}>
        Watch Trailer
      </Button>
      <Button component={Link} to={`/movie/${movie._id}/showtime`} variant="contained">
        Book Now
      </Button>
    </Container>
  );
}
