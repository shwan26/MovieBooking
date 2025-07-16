import { Container, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';

export default function CancelBookingPage() {
  const [bookingId, setBookingId] = useState('');

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Cancel Your Booking</Typography>
      <TextField
        label="Enter Booking ID"
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="outlined" disabled={!bookingId}>
        Submit Cancellation
      </Button>
    </Container>
  );
}
