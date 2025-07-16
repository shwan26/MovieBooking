import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const mockBookings = [
  { id: 'b101', movie: 'Inception', seats: ['A1', 'A2'], date: '2025-07-20', time: '14:00' },
  { id: 'b102', movie: 'Interstellar', seats: ['C3'], date: '2025-07-21', time: '20:00' }
];

export default function UserDashboardPage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>🎟 My Bookings</Typography>
      <List>
        {mockBookings.map((b) => (
          <ListItem key={b.id} divider>
            <ListItemText
              primary={`${b.movie} • ${b.date} at ${b.time}`}
              secondary={`Seats: ${b.seats.join(', ')}`}
            />
            <Button variant="outlined" color="error" size="small">Cancel</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
