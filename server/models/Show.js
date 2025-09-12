// models/Show.js
import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  isBooked: { type: Boolean, default: false },
});

const showSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  theatre: { type: Number, required: true, min: 1, max: 8 },
  format: { type: String, required: true, enum: ['TH Sub (Original)', 'TH Dub'] },
  originalLanguage: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return this.format !== 'TH Sub (Original)' || (v && v.trim().length > 0);
      },
      message: 'originalLanguage is required for TH Sub (Original).',
    },
  },
  ageRating: { type: String, required: true, trim: true },

  // Start date/time
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^\d{2}:\d{2}$/ },

  // Computed from duration (+ cleanup buffer)
  endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },

  seats: [seatSchema],
});

showSchema.index({ theatre: 1, date: 1, time: 1 });

export default mongoose.model('Show', showSchema);
