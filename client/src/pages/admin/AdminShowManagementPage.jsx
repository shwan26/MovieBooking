import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminShowManagementPage() {
  const [shows, setShows] = useState([]);

  const fetchShows = async () => {
    const res = await axios.get('http://localhost:5000/api/shows/all');
    setShows(res.data);
  };

  const deleteShow = async (id) => {
    await axios.delete(`http://localhost:5000/api/shows/${id}`);
    fetchShows();
  };

  useEffect(() => {
    fetchShows();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🕒 Manage Shows</Typography>
      <List>
        {shows.map(show => (
          <ListItem key={show._id} divider>
            <ListItemText
              primary={`${show.cinema} • ${show.format}`}
              secondary={`${show.date} @ ${show.time}`}
            />
            <Button color="error" onClick={() => deleteShow(show._id)}>Delete</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
