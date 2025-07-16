import { Container, Typography, Grid, Paper } from '@mui/material';

export default function AdminDashboard() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>📊 Admin Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>🎟 Total Bookings: 245</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>💰 Revenue: 36,750 THB</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>🎬 Movies Listed: 12</Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>🪑 Seats Booked: 418</Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
