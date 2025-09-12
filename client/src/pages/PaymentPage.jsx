// src/pages/PaymentPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/bookings/${bookingId}`)
      .then(res => setBooking(res.data.booking))
      .catch(() => setError('Failed to load booking'));
  }, [bookingId]);

  const handlePay = async () => {
    try {
      setError('');
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/contact`, contact);
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/confirm`);
      navigate('/confirmation');
    } catch (e) {
      setError(e.response?.data?.error || 'Payment/confirmation failed');
    }
  };

  if (!booking) return <Container sx={{ py: 3 }}>{error ? <Alert severity="error">{error}</Alert> : 'Loading...'}</Container>;

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>Payment</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {booking.movieTitle} • {booking.cinema} • {booking.date} {booking.time}<br/>
        Seats: {booking.seats.join(', ')} • Total: {booking.totalAmount} THB
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gap: 2, maxWidth: 480 }}>
        <TextField label="Full name" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} />
        <TextField label="Email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
        <TextField label="Phone" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
        <Button variant="contained" onClick={handlePay}>Pay & Confirm</Button>
      </Box>
    </Container>
  );
}
