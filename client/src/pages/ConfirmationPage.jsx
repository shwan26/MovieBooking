import { Container, Typography } from '@mui/material';

export default function ConfirmationPage() {
  return (
    <Container>
      <Typography variant="h4" color="success.main" gutterBottom>
        ✅ Booking Confirmed!
      </Typography>
      <Typography>Your ticket and QR code will be sent to your email.</Typography>
    </Container>
  );
}
