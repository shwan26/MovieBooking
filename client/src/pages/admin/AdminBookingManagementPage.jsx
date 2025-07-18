import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminBookingManagementPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/bookings') // make sure this route exists
      .then(res => setBookings(res.data));
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>📦 Booking Management</Typography>
      <List>
        {bookings.map(b => (
          <ListItem key={b._id}>
            <ListItemText
              primary={`Movie: ${b.movieId || b.showId} • Seats: ${b.seats.join(', ')}`}
              secondary={`User: ${b.userId} • Total: ${b.totalAmount} • Booked At: ${b.bookedAt}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
