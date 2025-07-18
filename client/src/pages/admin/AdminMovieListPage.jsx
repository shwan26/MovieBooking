import { Container, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminMovieListPage() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    const res = await axios.get('http://localhost:5000/api/movies');
    setMovies(res.data);
  };

  const deleteMovie = async (id) => {
    await axios.delete(`http://localhost:5000/api/movies/${id}`);
    fetchMovies();
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🎬 Manage Movies</Typography>
      <Button component={Link} to="/admin/movies/new" variant="contained" sx={{ mb: 2 }}>+ Add New Movie</Button>
      <List>
        {movies.map(movie => (
          <ListItem key={movie._id} divider>
            <ListItemText primary={movie.title} secondary={`${movie.genre} • ${movie.duration} mins`} />
            <Button color="error" onClick={() => deleteMovie(movie._id)}>Delete</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
