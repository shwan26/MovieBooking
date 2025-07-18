import {
  Container, Typography, Grid, Paper, CircularProgress, Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/dashboard')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard load error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>📊 Admin Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>💰 <strong>Total Revenue:</strong><br /> {stats.totalRevenue} THB</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>🎟 <strong>Total Bookings:</strong><br /> {stats.totalBookings}</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>📈 <strong>Avg. Seats per Booking:</strong><br /> {stats.avgSeatsPerBooking}</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>🏆 <strong>Top Show ID:</strong><br /> {stats.mostBookedShowId}</Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>🧭 Quick Admin Navigation</Typography>
      <Grid container spacing={2}>
        <Grid item><Button variant="outlined" onClick={() => navigate('/admin/movies')}>🎬 Manage Movies</Button></Grid>
        <Grid item><Button variant="outlined" onClick={() => navigate('/admin/shows')}>🕒 Manage Shows</Button></Grid>
        <Grid item><Button variant="outlined" onClick={() => navigate('/admin/bookings')}>📦 View Bookings</Button></Grid>
        <Grid item><Button variant="outlined" onClick={() => navigate('/admin/users/bookings')}>👥 User Booking Stats</Button></Grid>
        <Grid item><Button variant="outlined" onClick={() => navigate('/admin/shows/bookings')}>📈 Show Booking Stats</Button></Grid>
      </Grid>
    </Container>
  );
}
