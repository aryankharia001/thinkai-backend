const express = require('express');
const cors = require('cors');
const headlinesRouter = require('./routes/headlines');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { fetchHeadlines } = require('./controllers/headlinesController');
const AuthRoutes = require('./routes/AuthRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', headlinesRouter);
app.use('/user', AuthRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Cron every 12:00 AM IST
    cron.schedule('0 0 * * *', async () => {
      console.log("⏳ Cron job triggered — fetching headlines...");
      await fetchHeadlines();
    }, { timezone: "Asia/Kolkata" });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });