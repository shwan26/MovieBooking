import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function HomePage() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/movies')
      .then(res => setMovies(res.data))
      .catch(err => console.error('Error loading movies:', err));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🎬 Now Showing</Typography>
      <Grid container spacing={3}>
        {movies.map(movie => (
          <Grid item xs={12} sm={6} md={4} key={movie._id}>
            <Card>
              <CardMedia component="img" height="400" image={movie.posterUrl} alt={movie.title} />
              <CardContent>
                <Typography variant="h6">{movie.title}</Typography>
                <Typography variant="body2">{movie.genre} • {movie.duration} mins</Typography>
              </CardContent>
              <Button component={Link} to={`/movie/${movie._id}`} variant="contained" fullWidth>
                View Details
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
