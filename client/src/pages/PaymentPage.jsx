// src/pages/PaymentPage.jsx
import {
  Container, Grid, Card, CardContent, Typography, Divider, TextField, Button,
  CircularProgress, Alert, Box, Chip, Stack, IconButton, ToggleButtonGroup, ToggleButton, Paper
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const PRICES = { normal: 250, honeymoon: 400 };
const ADDON_PRICES = { popcorn: 100, cola: 20 };

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [show, setShow] = useState(null);
  const [movieTitle, setMovieTitle] = useState('');

  // Contact
  const [form, setForm] = useState({
    email: '',
    phone: '',
    membershipCard: '',
    couponId: '',
  });

  // Add-ons
  const [addons, setAddons] = useState({ popcorn: 0, cola: 0 });

  // Payment method
  const [method, setMethod] = useState('qr'); // 'qr' | 'card'
  const [qrCountdown, setQrCountdown] = useState(60);
  const [qrPaid, setQrPaid] = useState(false);

  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '', // MM/YY
    cvc: '',
  });

  // Load booking + show
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError('');

        const { data: bookingWrap } = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`);
        if (!mounted) return;
        const bookingData = bookingWrap?.booking || bookingWrap;
        if (!bookingData?._id) throw new Error('Invalid booking payload');
        setBooking(bookingData);

        const { data: showData } = await axios.get(`http://localhost:5000/api/shows/${bookingData.showId}`);
        if (!mounted) return;
        setShow(showData);

        const inlineTitle = showData.movieTitle || showData.title || showData.movieName || showData.movie?.title;
        if (inlineTitle) setMovieTitle(inlineTitle);
        else if (showData.movieId) {
          try {
            const { data: movie } = await axios.get(`http://localhost:5000/api/movies/${showData.movieId}`);
            if (mounted) setMovieTitle(movie?.title || '');
          } catch {}
        }
      } catch {
        if (mounted) setError('Failed to load payment details.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [bookingId]);

  // seatTypeMap priority: booking > show > default normal
  const seatTypeMap = useMemo(() => {
    if (booking?.seatTypeMap && typeof booking.seatTypeMap === 'object') return booking.seatTypeMap;
    if (show?.seatTypeMap && typeof show.seatTypeMap === 'object') return show.seatTypeMap;
    return {};
  }, [booking, show]);

  const seats = booking?.seats || [];
  const counts = useMemo(() => {
    let normal = 0, honeymoon = 0;
    for (const s of seats) (seatTypeMap[s] === 'honeymoon' ? honeymoon++ : normal++);
    return { normal, honeymoon };
  }, [seats, seatTypeMap]);

  const seatSubtotal = counts.normal * PRICES.normal + counts.honeymoon * PRICES.honeymoon;
  const addonSubtotal = addons.popcorn * ADDON_PRICES.popcorn + addons.cola * ADDON_PRICES.cola;
  const discount = seats.length === 4 ? 100 : 0;
  const total = Math.max(0, seatSubtotal + addonSubtotal - discount);

  const formatWithLanguage = useMemo(() => {
    if (!show) return '';
    if (show.format === 'TH Sub (Original)') {
      const lang = (show.originalLanguage || '').trim().toUpperCase();
      return lang ? `${lang} / TH Sub` : 'TH Sub';
    }
    if (show.format === 'TH Dub') return 'TH';
    return show.format || '';
  }, [show]);

  const theatreNumber = show?.theatre ?? show?.theaterNumber ?? show?.theater ?? show?.hall ?? 1;
  const onQty = (key, delta) =>
    setAddons(a => ({ ...a, [key]: Math.max(0, (a[key] || 0) + delta) }));

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ---------- QR simulation timer ----------
  useEffect(() => {
    // reset state on method change
    if (method !== 'qr') {
      setQrPaid(false);
      return;
    }
    setQrPaid(false);
    setQrCountdown(60);

    const iv = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          clearInterval(iv);
          setQrPaid(true); // auto-success after 60s
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [method]);

  // ---------- Card helpers ----------
  const maskCard = (num) => {
    const digits = (num || '').replace(/\s+/g, '');
    if (digits.length < 4) return '****';
    return '**** **** **** ' + digits.slice(-4);
  };
  const cardValid = useMemo(() => {
    const nameOk = card.name.trim().length > 2;
    const numberDigits = card.number.replace(/\s+/g, '');
    const numberOk = /^\d{13,19}$/.test(numberDigits);
    const expiryOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry.trim());
    const cvcOk = /^\d{3,4}$/.test(card.cvc.trim());
    return nameOk && numberOk && expiryOk && cvcOk;
  }, [card]);

  const canPay = method === 'qr' ? qrPaid : cardValid;

  // Confirm = contact + add-ons + payment meta + server-side seat lock + totals
  const handlePay = async () => {
    try {
      setError('');
      if (!form.email.trim()) return setError('Please enter your email.');
      if (!form.phone.trim()) return setError('Please enter your phone number.');
      if (!canPay) {
        return setError(method === 'qr' ? 'Waiting for QR payment to complete…' : 'Please fill valid card details.');
      }

      const payment =
        method === 'qr'
          ? { method: 'qr', simulated: true, elapsed: 60 - qrCountdown }
          : { method: 'card', last4: (card.number.replace(/\s+/g, '').slice(-4) || null) };

      const payload = {
        contact: {
          email: form.email.trim(),
          phone: form.phone.trim(),
          membershipCard: form.membershipCard.trim() || null,
          couponId: form.couponId.trim() || null,
        },
        addOns: { popcorn: addons.popcorn, cola: addons.cola },
        payment, // prototype metadata
      };

      const { data } = await axios.post(`http://localhost:5000/api/bookings/${bookingId}/confirm`, payload);
      const confirmed = data?.booking;
      if (!confirmed?._id) throw new Error('Payment/confirmation failed');

      navigate(`/confirmation/${confirmed._id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Payment failed.');
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>Payment</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* LEFT: Summary */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2"><b>Movie:</b> {movieTitle || '—'}</Typography>
              <Typography variant="body2"><b>Theatre:</b> {theatreNumber}</Typography>
              <Typography variant="body2"><b>Format:</b> {formatWithLanguage}</Typography>
              <Typography variant="body2"><b>Date & Time:</b> {show?.date} • {show?.time}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" sx={{ mb: 1 }}><b>Seats:</b></Typography>
              {seats.length ? (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                  {seats.map(s => (
                    <Chip key={s} size="small" label={`${s} • ${seatTypeMap[s] === 'honeymoon' ? 'H' : 'N'}`} />
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">No seats found.</Typography>
              )}

              <Stack spacing={0.5} sx={{ mt: 1 }}>
                <Typography variant="body2">Normal x {counts.normal} @ 250 = {counts.normal * 250} THB</Typography>
                <Typography variant="body2">Honeymoon x {counts.honeymoon} @ 400 = {counts.honeymoon * 400} THB</Typography>
                <Typography variant="body2">Popcorn x {addons.popcorn} @ 100 = {addons.popcorn * 100} THB</Typography>
                <Typography variant="body2">Cola x {addons.cola} @ 20 = {addons.cola * 20} THB</Typography>
                <Divider />
                <Typography variant="body2">Seats Subtotal: {seatSubtotal} THB</Typography>
                <Typography variant="body2">Add-ons: {addonSubtotal} THB</Typography>
                <Typography variant="body2" color={seats.length === 4 ? 'success.main' : 'text.secondary'}>
                  Discount (4 seats): −{seats.length === 4 ? 100 : 0} THB
                </Typography>
                <Typography variant="h6">Total: {total} THB</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        

        {/* RIGHT: Contact + Payment */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add-ons, Contact & Payment</Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Add-ons */}
              <Typography variant="subtitle1" gutterBottom>Add-ons</Typography>
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>Popcorn</Typography>
                  <IconButton size="small" onClick={() => onQty('popcorn', -1)}><Remove fontSize="small" /></IconButton>
                  <Typography>{addons.popcorn}</Typography>
                  <IconButton size="small" onClick={() => onQty('popcorn', +1)}><Add fontSize="small" /></IconButton>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>Cola</Typography>
                  <IconButton size="small" onClick={() => onQty('cola', -1)}><Remove fontSize="small" /></IconButton>
                  <Typography>{addons.cola}</Typography>
                  <IconButton size="small" onClick={() => onQty('cola', +1)}><Add fontSize="small" /></IconButton>
                </Stack>
              </Stack>

              {/* Contact */}
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Membership Card" name="membershipCard" value={form.membershipCard} onChange={handleChange} placeholder="(optional)" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Coupon ID" name="couponId" value={form.couponId} onChange={handleChange} placeholder="(optional)" />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              

              <Divider sx={{ my: 2 }} />

              {/* Payment method switch */}
              <Typography variant="subtitle1" gutterBottom>Choose Payment Method</Typography>
              <ToggleButtonGroup
                exclusive
                color="primary"
                value={method}
                onChange={(_, v) => v && setMethod(v)}
                sx={{ mb: 2 }}
              >
                <ToggleButton value="qr">Scan QR</ToggleButton>
                <ToggleButton value="card">Credit / Debit Card</ToggleButton>
              </ToggleButtonGroup>

              {/* QR Pay */}
              {method === 'qr' && (
                <Stack spacing={1}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    {/* Placeholder QR area */}
                    <Box
                      sx={{
                        width: 220, height: 220, mx: 'auto',
                        bgcolor: 'grey.200', border: '1px dashed', borderColor: 'grey.400'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      (Prototype) Scan this QR in your banking app. We’ll auto-complete in {qrPaid ? 0 : qrCountdown}s.
                    </Typography>
                  </Paper>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={qrPaid ? 'Payment detected' : `Waiting… ${qrCountdown}s`} color={qrPaid ? 'success' : 'default'} />
                    {!qrPaid && (
                      <Button size="small" onClick={() => { setQrPaid(true); setQrCountdown(0); }}>
                        I’ve paid
                      </Button>
                    )}
                  </Stack>
                </Stack>
              )}

              {/* Card Pay */}
              {method === 'card' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name on Card"
                      value={card.name}
                      onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={e => {
                        const v = e.target.value.replace(/[^\d]/g, '').slice(0, 19);
                        const spaced = v.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                        setCard(c => ({ ...c, number: spaced }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry (MM/YY)"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVC"
                      placeholder="123"
                      value={card.cvc}
                      onChange={e => setCard(c => ({ ...c, cvc: e.target.value.replace(/[^\d]/g, '').slice(0, 4) }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      This is a prototype. Card info is not processed; we just validate format and proceed.
                    </Typography>
                  </Grid>
                </Grid>
              )}

              <Button
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                onClick={handlePay}
                disabled={!canPay}
              >
                Pay {total} THB
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
