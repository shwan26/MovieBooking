// server/index.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`✅ Server running at http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error('MongoDB Error:', err));
