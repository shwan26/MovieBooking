import { Container, Typography, TextField, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { state } = useLocation(); // seats, show, total passed here
  const [member, setMember] = useState(false);
  const [coupon, setCoupon] = useState('');

  const applyDiscount = () => {
    let total = state.total;
    if (member) total *= 0.9;
    if (coupon === 'B4G1') {
      const free = Math.floor(state.seats.length / 5);
      total -= free * 150;
    }
    return Math.round(total);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Confirm Your Booking
      </Typography>
      <Typography>Seats: {state.seats.join(', ')}</Typography>
      <Typography>Cinema: {state.show.cinema}</Typography>
      <Typography>Date: {state.show.date} {state.show.time}</Typography>

      <TextField
        label="Coupon Code"
        value={coupon}
        onChange={e => setCoupon(e.target.value)}
        sx={{ my: 2 }}
      />
      <Button
        variant={member ? 'contained' : 'outlined'}
        onClick={() => setMember(!member)}
        sx={{ mb: 2 }}
      >
        {member ? 'Member Discount Applied' : 'Apply Member Discount'}
      </Button>

      <Typography variant="h6">
        Total Price: {applyDiscount()} THB
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={() => {
          // proceed to final payment / booking call
          navigate('/payment');
        }}
      >
        Confirm & Pay
      </Button>
    </Container>
  );
}
