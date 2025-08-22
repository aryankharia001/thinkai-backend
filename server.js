const express = require('express');
const cors = require('cors');
const headlinesRouter = require('./routes/headlines');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { fetchHeadlines } = require('./controllers/headlinesController');
const AuthRoutes = require('./routes/AuthRoutes');
const UserRoutes = require('./routes/UserRoutes');
const CourseRoutes = require('./routes/courses');
const PaymentRoutes = require('./routes/paymentRoutes');
const imageRoutes = require('./routes/images');


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true, // allow cookies/headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Routes
app.use('/api', headlinesRouter);
app.use('/api/auth', AuthRoutes);
app.use('/api', UserRoutes);
app.use('/api', CourseRoutes);
app.use('/api/payment', PaymentRoutes);
app.use('/api/images', imageRoutes);


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