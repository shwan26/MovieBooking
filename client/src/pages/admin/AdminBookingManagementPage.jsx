import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const mockBookings = [
  { id: 'b1', movie: 'Inception', user: 'jo@example.com', seat: 'A1', status: 'Confirmed' },
  { id: 'b2', movie: 'Interstellar', user: 'mai@example.com', seat: 'B2', status: 'Confirmed' }
];

export default function AdminBookingManagementPage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>📦 Manage Bookings</Typography>
      <List>
        {mockBookings.map(b => (
          <ListItem key={b.id}>
            <ListItemText
              primary={`${b.movie} • ${b.user}`}
              secondary={`Seat: ${b.seat} • Status: ${b.status}`}
            />
            <Button size="small" color="error">Cancel</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
