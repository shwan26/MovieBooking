import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedSeats = location.state?.selectedSeats || [];

  const total = selectedSeats.length * 150;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Checkout Summary</Typography>
      <List>
        {selectedSeats.map((s, index) => (
          <ListItem key={index}>
            <ListItemText primary={`Seat ${s}`} />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6">Total: {total} THB</Typography>
      <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/payment', { state: { total } })}>
        Proceed to Payment
      </Button>
    </Container>
  );
}
