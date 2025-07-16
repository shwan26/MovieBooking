import { Container, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>🛡️ Admin Login</Typography>
      <TextField
        fullWidth
        label="Email"
        sx={{ mb: 2 }}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        sx={{ mb: 2 }}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
      />
      <Button fullWidth variant="contained" onClick={() => navigate('/admin/dashboard')}>
        Login as Admin
      </Button>
    </Container>
  );
}
