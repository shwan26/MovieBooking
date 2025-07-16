import { Container, Typography, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const total = location.state?.total || 0;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Payment</Typography>
      <Typography variant="body1" gutterBottom>Total to pay: {total} THB</Typography>
      <Button variant="contained" onClick={() => navigate('/confirmation')}>
        Pay Now
      </Button>
    </Container>
  );
}
