import {
  Container, Typography, List, ListItem, ListItemText, LinearProgress
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminShowListPage() {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/shows/all')
      .then(res => setShows(res.data));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🎭 All Shows</Typography>
      <List>
        {shows.map(show => {
          const booked = show.seats.filter(s => s.isBooked).length;
          const capacity = show.seats.length;
          const percent = Math.round((booked / capacity) * 100);

          return (
            <ListItem key={show._id} divider>
              <ListItemText
                primary={`${show.cinema} • ${show.format} • ${show.date} @ ${show.time}`}
                secondary={`Booked ${booked}/${capacity} seats (${percent}%)`}
              />
              <LinearProgress variant="determinate" value={percent} sx={{ width: 200, ml: 2 }} />
            </ListItem>
          );
        })}
      </List>
    </Container>
  );
}
