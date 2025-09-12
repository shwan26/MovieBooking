// pages/ShowtimePage.jsx
import { Container, Typography, Grid, Button, Chip, Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, VolumeUp } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const dayKey = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export default function ShowtimePage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    // start from today (or nearest Sat like your screenshot if you want)
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [selectedDate, setSelectedDate] = useState(() => dayKey(new Date()));

  useEffect(() => {
    axios.get('http://localhost:5000/api/shows/all')
      .then(res => {
        // normalize theatre (legacy "cinema" fallback), limit 1..8, match movie
        const normalized = res.data.map(s => ({
          ...s,
          theatre: s.theatre ?? (/^[1-8]$/.test(String(s.cinema)) ? Number(s.cinema) : undefined),
        }));

        const filtered = normalized
          .filter(s => String(s.movieId) === String(movieId))
          .filter(s => Number(s.theatre) >= 1 && Number(s.theatre) <= 8);

        // default selected date = first available show date if today's empty
        const dates = [...new Set(filtered.map(s => s.date))].sort();
        if (dates.length && !dates.includes(selectedDate)) {
          setSelectedDate(dates[0]);
        }

        filtered.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        setShows(filtered);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const showsForSelected = useMemo(
    () => shows.filter(s => s.date === selectedDate),
    [shows, selectedDate]
  );

  // group by theatre
  const groups = useMemo(() => {
    const m = new Map();
    for (const s of showsForSelected) {
      if (!m.has(s.theatre)) m.set(s.theatre, []);
      m.get(s.theatre).push(s);
    }
    for (const [k, arr] of m) {
      arr.sort((a, b) => a.time.localeCompare(b.time));
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]); // by theatre number
  }, [showsForSelected]);

  const formatWithLanguage = (show) => {
    if (show.format === 'TH Sub (Original)') {
      const lang = (show.originalLanguage || '').trim().toUpperCase();
      // Show like "EN / TH Sub"
      return lang ? `${lang} / TH Sub` : 'TH Sub';
    }
    if (show.format === 'TH Dub') {
      return 'TH';
    }
    return show.format; // fallback
  };


  return (
    <Container>
      <Typography variant="h4" gutterBottom>Select Showtime</Typography>

      {/* Date strip */}
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft /></IconButton>
        <Box display="flex" gap={1} flexWrap="nowrap" sx={{ overflowX: 'auto' }}>
          {weekDays.map((d) => {
            const key = dayKey(d);
            const labelTop = d.toLocaleDateString(undefined, { weekday: 'short' });
            const isActive = key === selectedDate;
            return (
              <Button
                key={key}
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => setSelectedDate(key)}
                sx={{ minWidth: 96 }}
              >
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="caption">{labelTop}</Typography>
                  <Typography variant="subtitle2">{d.getDate().toString().padStart(2, '0')}</Typography>
                </Box>
              </Button>
            );
          })}
        </Box>
        <IconButton onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight /></IconButton>
      </Box>

      {/* Groups by theatre */}
      {groups.length === 0 ? (
        <Typography>No showtimes found for this date.</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          {groups.map(([theatre, items]) => (
            <Box key={theatre} sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', pt: 2 }}>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ letterSpacing: 1 }}>
                  THEATRE {theatre}
                </Typography>

                {/* Speaker icon just for visual parity */}
                <VolumeUp fontSize="small" />

                {/* Show “Sub/Dub + Original Language (if any)” from first item */}
                <Typography variant="body2">{formatWithLanguage(items[0])}</Typography>

                {/* Age rating chip */}
                <Chip
                  label={items[0].ageRating || 'U'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Times */}
              <Grid container spacing={2}>
                {items.map((show) => (
                  <Grid item key={show._id}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/show/${show._id}/seats`)}
                    >
                      {show.time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}
