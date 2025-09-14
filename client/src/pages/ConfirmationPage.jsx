// src/pages/ConfirmationPage.jsx
import {
  Container, Card, CardContent, Typography, Divider, Grid, Box, Chip, Stack, Button, CircularProgress, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode';                 // ← NEW

const PRICES = { normal: 250, honeymoon: 400 };
const ADDON_PRICES = { popcorn: 100, cola: 20 };

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [show, setShow] = useState(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');    // ← NEW

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');

        const { data: wrap } = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`);
        const b = wrap?.booking || wrap;
        if (!b?._id) throw new Error('Invalid booking payload');
        if (mounted) setBooking(b);

        const { data: s } = await axios.get(`http://localhost:5000/api/shows/${b.showId}`);
        if (mounted) setShow(s);

        const inlineTitle = s.movieTitle || s.title || s.movieName || s.movie?.title;
        if (inlineTitle) {
          if (mounted) setMovieTitle(inlineTitle);
        } else if (s.movieId) {
          try {
            const { data: m } = await axios.get(`http://localhost:5000/api/movies/${s.movieId}`);
            if (mounted) setMovieTitle(m?.title || '');
          } catch {}
        }
      } catch (e) {
        if (mounted) setError('Failed to load receipt.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [bookingId]);

  // Generate QR for this confirmation link (client-side, no network)
  useEffect(() => {
    const makeQR = async () => {
      try {
        const url = `${window.location.origin}/confirmation/${bookingId}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 220, margin: 1 });
        setQrDataUrl(dataUrl);
      } catch {
        setQrDataUrl('');
      }
    };
    if (bookingId) makeQR();
  }, [bookingId]);

  // Seat type mapping for rendering tags
  const seatTypeMap = useMemo(() => {
    if (booking?.seatTypeMap && typeof booking.seatTypeMap === 'object') return booking.seatTypeMap;
    if (show?.seatTypeMap && typeof show.seatTypeMap === 'object') return show.seatTypeMap;
    return {};
  }, [booking, show]);

  const seats = booking?.seats || [];

  // Pricing (prefer server-calculated booking.pricing; fallback compute)
  const serverP = booking?.pricing;
  const computedCounts = useMemo(() => {
    let normal = 0, honeymoon = 0;
    for (const s of seats) (seatTypeMap[s] === 'honeymoon' ? honeymoon++ : normal++);
    return { normal, honeymoon };
  }, [seats, seatTypeMap]);

  const counts = serverP?.counts || computedCounts;
  const seatSubtotal = serverP?.seatSubtotal ?? (counts.normal * PRICES.normal + counts.honeymoon * PRICES.honeymoon);
  const addOns = serverP?.addOns || { popcorn: 0, cola: 0, prices: ADDON_PRICES };
  const addonSubtotal = serverP?.addonSubtotal ?? ((addOns.popcorn || 0) * ADDON_PRICES.popcorn + (addOns.cola || 0) * ADDON_PRICES.cola);
  const discount = serverP?.discount ?? (seats.length === 4 ? 100 : 0);
  const total = booking?.totalAmount ?? Math.max(0, seatSubtotal + addonSubtotal - discount);

  const theatreNumber = show?.theatre ?? show?.theaterNumber ?? show?.theater ?? show?.hall ?? 1;
  const formatWithLanguage = useMemo(() => {
    if (!show) return '';
    if (show.format === 'TH Sub (Original)') {
      const lang = (show.originalLanguage || '').trim().toUpperCase();
      return lang ? `${lang} / TH Sub` : 'TH Sub';
    }
    if (show.format === 'TH Dub') return 'TH';
    return show.format || '';
  }, [show]);

  const issuedAt = new Date(booking?.updatedAt || booking?.createdAt || Date.now());
  const printReceipt = () => window.print();

  const confirmationUrl = `${window.location.origin}/confirmation/${bookingId}`; // for copy button

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Receipt</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/')}>Home</Button>
          <Button variant="contained" onClick={printReceipt}>Print</Button>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          {/* Header */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>{movieTitle || '—'}</Typography>
              <Typography variant="body2"><b>Theatre:</b> {theatreNumber}</Typography>
              <Typography variant="body2"><b>Format:</b> {formatWithLanguage}</Typography>
              <Typography variant="body2"><b>Date & Time:</b> {show?.date} • {show?.time}</Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2"><b>Booking ID:</b> {booking?._id}</Typography>
              <Typography variant="body2"><b>Status:</b> {booking?.status || '—'}</Typography>
              <Typography variant="body2"><b>Issued at:</b> {issuedAt.toLocaleString()}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Contact */}
          <Typography variant="subtitle1" gutterBottom>Contact</Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}><Typography variant="body2"><b>Email:</b> {booking?.contact?.email || '—'}</Typography></Grid>
            <Grid item xs={12} md={6}><Typography variant="body2"><b>Phone:</b> {booking?.contact?.phone || '—'}</Typography></Grid>
            <Grid item xs={12} md={6}><Typography variant="body2"><b>Membership Card:</b> {booking?.contact?.membershipCard || '—'}</Typography></Grid>
            <Grid item xs={12} md={6}><Typography variant="body2"><b>Coupon ID:</b> {booking?.contact?.couponId || '—'}</Typography></Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Seats */}
          <Typography variant="subtitle1" gutterBottom>Seats</Typography>
          {seats.length ? (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {seats.map(s => (
                <Chip key={s} size="small" label={`${s} • ${seatTypeMap[s] === 'honeymoon' ? 'H' : 'N'}`} />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No seats recorded.</Typography>
          )}

          {/* Pricing */}
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <Typography variant="body2">Normal x {counts.normal} @ {PRICES.normal} = {counts.normal * PRICES.normal} THB</Typography>
            <Typography variant="body2">Honeymoon x {counts.honeymoon} @ {PRICES.honeymoon} = {counts.honeymoon * PRICES.honeymoon} THB</Typography>
            <Typography variant="body2">Popcorn x {addOns.popcorn || 0} @ {ADDON_PRICES.popcorn} = {(addOns.popcorn || 0) * ADDON_PRICES.popcorn} THB</Typography>
            <Typography variant="body2">Cola x {addOns.cola || 0} @ {ADDON_PRICES.cola} = {(addOns.cola || 0) * ADDON_PRICES.cola} THB</Typography>
            <Divider />
            <Typography variant="body2">Seats Subtotal: {seatSubtotal} THB</Typography>
            <Typography variant="body2">Add-ons: {addonSubtotal} THB</Typography>
            <Typography variant="body2" color={discount ? 'success.main' : 'text.secondary'}>
              Discount (4 seats): −{discount} THB
            </Typography>
            <Typography variant="h6">Total Paid: {total} THB</Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* QR Link to this receipt */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Your Receipt QR</Typography>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Receipt QR Code"
                width={220}
                height={220}
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">QR unavailable</Typography>
            )}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>{confirmationUrl}</Typography>
              <Button
                size="small"
                onClick={() => navigator.clipboard?.writeText(confirmationUrl)}
              >
                Copy link
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Footer / Notes */}
          <Typography variant="caption" color="text.secondary">
            Please present this receipt (or Booking ID) at the theatre entrance. Seats are held under this booking and have been confirmed.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
