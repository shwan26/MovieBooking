// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import ShowtimePage from './pages/ShowtimePage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import CancelBookingPage from './pages/CancelBookingPage';
import UserDashboardPage from './pages/UserDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovieListPage from './pages/admin/AdminMovieListPage';
import AdminAddMoviePage from './pages/admin/AdminAddMoviePage';
import AdminAddShowPage from './pages/admin/AdminAddShowPage';
import AdminShowManagementPage from './pages/admin/AdminShowManagementPage';
import AdminBookingManagementPage from './pages/admin/AdminBookingManagementPage';

function App() {
  return (
    <Routes>
      {/* User Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
      <Route path="/movie/:movieId/showtime" element={<ShowtimePage />} />
      <Route path="/show/:showId/seats" element={<SeatSelectionPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
      <Route path="/cancel" element={<CancelBookingPage />} />
      <Route path="/dashboard" element={<UserDashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Pages */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/movies" element={<AdminMovieListPage />} />
      <Route path="/admin/movies/new" element={<AdminAddMoviePage />} />
      <Route path="/admin/shows/new" element={<AdminAddShowPage />} />
      <Route path="/admin/shows" element={<AdminShowManagementPage />} />
      <Route path="/admin/bookings" element={<AdminBookingManagementPage />} />
    </Routes>
  );
}

export default App;