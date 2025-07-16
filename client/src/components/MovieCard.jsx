import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <Card sx={{ maxWidth: 300 }}>
      <CardMedia
        component="img"
        height="400"
        image={movie.posterUrl}
        alt={movie.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {movie.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {movie.genre} • {movie.duration} mins
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/movie/${movie._id}`}>
          View
        </Button>
        <Button size="small" component={Link} to={`/booking/${movie._id}`}>
          Book
        </Button>
      </CardActions>
    </Card>
  );
}
