// src/pages/admin/AdminAddShowPage.jsx
import { Container, Typography, TextField, Button, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const THEATRE_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);
const AGE_OPTIONS = ['U', 'U 13+', '15+', '18+'];
const FORMAT_OPTIONS = ['TH Sub (Original)', 'TH Dub'];

export default function AdminAddShowPage() {
  const [form, setForm] = useState({
    movieId: '',
    theatre: '',
    format: '',
    originalLanguage: '',
    ageRating: '',
    date: '',
    time: '',
    autoNext: false,
  });
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/movies')
      .then(res => setMovies(res.data))
      .catch(err => console.error('Failed to load movies:', err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (!form.movieId) return alert('Select a movie.');
      if (!form.theatre) return alert('Select theatre (1–8).');
      if (!form.format) return alert('Select format.');
      if (form.format === 'TH Sub (Original)' && !form.originalLanguage.trim()) {
        return alert('Specify the original language.');
      }
      if (!form.ageRating) return alert('Select age rating.');
      if (!form.date) return alert('Choose date.');
      if (!form.time) return alert('Choose time.');

      const payload = {
        movieId: form.movieId,
        theatre: Number(form.theatre),
        format: form.format,
        ageRating: form.ageRating,
        date: form.date,
        time: form.time,
        autoNext: form.autoNext,
      };
      if (form.format === 'TH Sub (Original)') {
        payload.originalLanguage = form.originalLanguage.trim();
      }

      const { data } = await axios.post('http://localhost:5000/api/shows', payload);
      alert('✅ Show added successfully!');
      console.log('created:', data);
      setForm({
        movieId: '', theatre: '', format: '', originalLanguage: '',
        ageRating: '', date: '', time: '', autoNext: false,
      });
    } catch (err) {
      const data = err?.response?.data;
      const fromErrors = data?.errors ? Object.values(data.errors)[0]?.message : null;
      const msg = data?.error || data?.message || fromErrors || 'Failed to add show.';
      alert(`❌ ${msg}`);
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>➕ Add New Show</Typography>

      <TextField select label="Movie" name="movieId" fullWidth sx={{ mb: 2 }}
        value={form.movieId} onChange={handleChange}>
        <MenuItem value="">Select movie</MenuItem>
        {movies.map(m => <MenuItem key={m._id} value={m._id}>{m.title}</MenuItem>)}
      </TextField>

      <TextField select name="theatre" label="Theatre (1–8)" fullWidth sx={{ mb: 2 }}
        value={form.theatre} onChange={handleChange}>
        <MenuItem value="">Select theatre</MenuItem>
        {THEATRE_OPTIONS.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
      </TextField>

      <TextField select name="format" label="Format" fullWidth sx={{ mb: 2 }}
        value={form.format} onChange={handleChange}
        helperText={form.format === 'TH Sub (Original)' ? 'Provide Original Language below.' : ' '}>
        <MenuItem value="">Select format</MenuItem>
        {FORMAT_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
      </TextField>

      {form.format === 'TH Sub (Original)' && (
        <TextField name="originalLanguage" label="Original Language (e.g., EN, JP)" fullWidth sx={{ mb: 2 }}
          value={form.originalLanguage} onChange={handleChange} />
      )}

      <TextField select name="ageRating" label="Age Rating" fullWidth sx={{ mb: 2 }}
        value={form.ageRating} onChange={handleChange}>
        <MenuItem value="">Select age rating</MenuItem>
        {AGE_OPTIONS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
      </TextField>

      <TextField name="date" type="date" label="Date" fullWidth sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }} value={form.date} onChange={handleChange} />
      <TextField name="time" type="time" label="Time" fullWidth sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }} value={form.time} onChange={handleChange} />

      <FormControlLabel
        control={<Checkbox checked={form.autoNext} onChange={e => setForm(f => ({...f, autoNext: e.target.checked}))} />}
        label="Also create next show (duration + 30m)"
      />

      <Button variant="contained" fullWidth onClick={handleSubmit}>Create Show</Button>
    </Container>
  );
}
