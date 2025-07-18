import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminUserBookingStatsPage() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/dashboard')
      .then(res => setStats(res.data.bookingsPerUser || []));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>👥 User Booking Stats</Typography>
      <List>
        {stats.map(user => (
          <ListItem key={user._id}>
            <ListItemText primary={`User: ${user._id}`} secondary={`Bookings: ${user.count}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
