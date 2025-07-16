import { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminMovieListPage() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/movies');
      setMovies(res.data);
    } catch (err) {
      console.error('❌ Error loading movies:', err);
    }
  };

  const deleteMovie = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/movies/${id}`);
      fetchMovies(); // Refresh
    } catch (err) {
      console.error('❌ Error deleting movie:', err);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🎬 Manage Movies</Typography>
      <Button variant="contained" component={Link} to="/admin/movies/new" sx={{ mb: 2 }}>
        + Add New Movie
      </Button>
      <List>
        {movies.map((movie) => (
          <ListItem key={movie._id} divider>
            <ListItemText primary={movie.title} secondary={`${movie.genre} • ${movie.duration} mins`} />
            <Button color="error" size="small" onClick={() => deleteMovie(movie._id)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
