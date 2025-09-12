// src/pages/SeatSelectionPage.jsx
import {
  Box, Container, Typography, Grid, Button, CircularProgress, Alert, Card, CardContent, Divider, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import SeatButton from '../components/SeatButton';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [movieTitle, setMovieTitle] = useState('');   // NEW
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const { data: showData } = await axios.get(`http://localhost:5000/api/shows/${showId}`);
        if (!mounted) return;
        setShow(showData);

        // Try to read title directly if backend provides it in any common shape
        const inlineTitle =
          showData.movieTitle ||
          showData.title ||
          showData.movieName ||
          showData.movie?.title;

        if (inlineTitle) {
          setMovieTitle(inlineTitle);
        } else if (showData.movieId) {
          // Fallback: fetch the movie by id
          try {
            const { data: movieData } = await axios.get(`http://localhost:5000/api/movies/${showData.movieId}`);
            if (!mounted) return;
            setMovieTitle(movieData?.title || '');
          } catch {
            // Silent fail — keep empty string; UI will show placeholder
          }
        }
      } catch {
        if (!mounted) return;
        setError('Failed to load show.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [showId]);

  // Map for quick seat lookup
  const seatMap = useMemo(() => {
    if (!show?.seats) return {};
    return Object.fromEntries(show.seats.map(s => [s.seatNumber, s]));
  }, [show]);
  const getSeat = (seatId) => seatMap[seatId] || null;

  const toggleSeat = (seatNumber) => {
    if (!show?.seats) return;
    const seatObj = show.seats.find(s => s.seatNumber === seatNumber);
    if (seatObj?.isBooked) return;

    if (!selectedSeats.includes(seatNumber) && selectedSeats.length >= 4) {
      setError('You can only book up to 4 seats at once.');
      return;
    }
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const pricePerSeat = show?.price ?? 300;
  const total = pricePerSeat * selectedSeats.length;

  const handleProceed = async () => {
    try {
      setError('');
      const res = await axios.post(`http://localhost:5000/api/bookings`, {
        showId,
        seats: selectedSeats
      });
      const bookingId = res.data?.booking?._id;
      if (!bookingId) throw new Error('No booking id returned');
      navigate(`/payment/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Booking failed');
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (!show) return <Typography sx={{ m: 4 }}>Show not found</Typography>;

  // Normalize theatre fields (support various backends)
  const theatreNumber =
    show.theatre ??
    show.theaterNumber ??
    show.theater ??
    show.hall ??
    1;

  // Match the format display used in ShowtimePage
  const formatWithLanguage = (() => {
    if (show.format === 'TH Sub (Original)') {
      const lang = (show.originalLanguage || '').trim().toUpperCase();
      return lang ? `${lang} / TH Sub` : 'TH Sub';
    }
    if (show.format === 'TH Dub') return 'TH';
    return show.format || '';
  })();

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Select Seats — Theatre {theatreNumber} • {formatWithLanguage} • {show.date} at {show.time}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* LEFT: Screen + Seats */}
        <Grid item xs={12} md={8} lg={9}>
          <Box
            sx={{
              width: '100%', textAlign: 'center',
              bgcolor: 'grey.900', color: 'white', py: 1, mb: 3, borderRadius: 1
            }}
          >
            SCREEN
          </Box>

          {'ABCDEFGHIJ'.split('').map(row => (
            <Grid item key={row} sx={{ mb: 1 }}>
              <Grid container spacing={0.5} justifyContent="center" alignItems="center">
                <Grid item>
                  <Typography variant="caption" sx={{ width: 14, display: 'inline-block' }}>
                    {row}
                  </Typography>
                </Grid>
                {Array.from({ length: 10 }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  const seat = getSeat(seatId);
                  return (
                    <Grid item key={seatId}>
                      <SeatButton
                        seat={seat}
                        seatId={seatId}
                        selected={selectedSeats.includes(seatId)}
                        onClick={() => toggleSeat(seatId)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          ))}
        </Grid>

        {/* RIGHT: Summary */}
        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2"><b>Movie:</b> {movieTitle || '—'}</Typography>
              <Typography variant="body2"><b>Theatre:</b> {theatreNumber}</Typography>
              <Typography variant="body2"><b>Format:</b> {formatWithLanguage}</Typography>
              <Typography variant="body2"><b>Date & Time:</b> {show.date} • {show.time}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ mb: 1 }}><b>Seats:</b></Typography>
              {selectedSeats.length ? (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                  {selectedSeats.map(s => <Chip size="small" key={s} label={s} />)}
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No seats selected</Typography>
              )}

              <Typography variant="body2" sx={{ mt: 1 }}>
                <b>Price/seat:</b> {pricePerSeat} THB
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: {total} THB
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={!selectedSeats.length}
                onClick={handleProceed}
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
