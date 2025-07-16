import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchMovies = () => axios.get(`${API_BASE}/movies`);
export const addMovie = (data) => axios.post(`${API_BASE}/movies`, data);

