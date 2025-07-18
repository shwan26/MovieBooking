import Booking from '../models/Booking.js';

export const getDashboardStats = async (req, res) => {
  const totalRevenueAgg = await Booking.aggregate([
    { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
  ]);

  const totalBookings = await Booking.countDocuments();

  const avgSeatsAgg = await Booking.aggregate([
    { $group: { _id: null, avg: { $avg: { $size: "$seats" } } } }
  ]);

  const bookingsPerShow = await Booking.aggregate([
    { $group: { _id: "$showId", count: { $sum: 1 } } }
  ]);

  const bookingsPerUser = await Booking.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } }
  ]);

  const mostBookedShowId = bookingsPerShow.sort((a, b) => b.count - a.count)[0]?._id;

  res.json({
    totalRevenue: totalRevenueAgg[0]?.revenue || 0,
    totalBookings,
    avgSeatsPerBooking: avgSeatsAgg[0]?.avg?.toFixed(2) || 0,
    bookingsPerShow,
    bookingsPerUser,
    mostBookedShowId
  });
};
