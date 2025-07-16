import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Select Theater, Date, and Time for Movie ID: {id}
      </Typography>
      {/* Add dropdowns or selection UI here */}
      <Button variant="contained" onClick={() => navigate(`/seats/${id}`)}>
        Continue to Seat Selection
      </Button>
    </Container>
  );
}
