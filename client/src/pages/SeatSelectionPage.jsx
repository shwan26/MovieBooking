import { Container, Typography, Grid, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const mockSeats = Array.from({ length: 30 }, (_, i) => ({
  seatNumber: i + 1,
  isBooked: [5, 10, 15].includes(i + 1)
}));

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    setSelectedSeats(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Select Your Seats (Show: {showId})</Typography>
      <Grid container spacing={1}>
        {mockSeats.map((seat) => (
          <Grid item key={seat.seatNumber}>
            <Button
              variant={
                seat.isBooked
                  ? 'outlined'
                  : selectedSeats.includes(seat.seatNumber)
                  ? 'contained'
                  : 'outlined'
              }
              color={seat.isBooked ? 'error' : selectedSeats.includes(seat.seatNumber) ? 'primary' : 'inherit'}
              onClick={() => toggleSeat(seat)}
              disabled={seat.isBooked}
            >
              {seat.seatNumber}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Button
        sx={{ mt: 4 }}
        variant="contained"
        disabled={selectedSeats.length === 0}
        onClick={() => navigate('/checkout', { state: { selectedSeats } })}
      >
        Continue to Checkout
      </Button>
    </Container>
  );
}
