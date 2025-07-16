import {
  Container, Typography, Grid, Button, CircularProgress, Alert, TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/shows/${showId}`)
      .then(res => {
        setShow(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load show.');
        setLoading(false);
      });
  }, [showId]);

  const toggleSeat = (seatNumber) => {
    if (show.seats.find(s => s.seatNumber === seatNumber)?.isBooked) return;
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBooking = async () => {
    try {
      await axios.post(`http://localhost:5000/api/shows/book`, {
        showId,
        selectedSeats,
        user: user || 'Guest'
      });
      navigate('/confirmation');
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (!show) return <Typography>Show not found</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Select Seats — {show.cinema} • {show.format} • {show.date} at {show.time}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        label="Your name or email (optional)"
        sx={{ mb: 2 }}
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />

      <Grid container spacing={1}>
        {show.seats.map((seat) => (
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
              onClick={() => toggleSeat(seat.seatNumber)}
              disabled={seat.isBooked}
            >
              {seat.seatNumber}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Button
        sx={{ mt: 3 }}
        variant="contained"
        disabled={selectedSeats.length === 0}
        onClick={handleBooking}
      >
        Confirm Booking ({selectedSeats.length * 150} THB)
      </Button>
    </Container>
  );
}
