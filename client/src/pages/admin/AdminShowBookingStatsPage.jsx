import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminShowBookingStatsPage() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/dashboard')
      .then(res => setStats(res.data.bookingsPerShow || []));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🎬 Bookings per Show</Typography>
      <List>
        {stats.map(show => (
          <ListItem key={show._id}>
            <ListItemText primary={`Show ID: ${show._id}`} secondary={`Bookings: ${show.count}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
