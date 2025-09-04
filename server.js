const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { fetchHeadlines } = require('./controllers/headlinesController');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5200;

// Middleware
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Import all route files
const headlinesRouter = require('./routes/headlines');
const AuthRoutes = require('./routes/AuthRoutes');
const UserRoutes = require('./routes/UserRoutes');
const CourseRoutes = require('./routes/courses');
const PaymentRoutes = require('./routes/paymentRoutes');
const imageRoutes = require('./routes/images');
const LibraryRoutes = require('./routes/LibraryRoutes');
const ContentRoutes = require('./routes/ContentRoutes');

// API Routes (must come before static files)
app.use('/api', headlinesRouter);
app.use('/api/auth', AuthRoutes);
app.use('/api', UserRoutes);
app.use('/api', CourseRoutes);
app.use('/api/payment', PaymentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api', LibraryRoutes);
app.use('/api', ContentRoutes);

// Test API endpoint to verify backend is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all non-API routes
// This must be the last route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    
    // Setup cron job for fetching headlines
    cron.schedule('0 0 * * *', async () => {
      console.log("⏰ Cron job triggered — fetching headlines...");
      try {
        await fetchHeadlines();
      } catch (error) {
        console.error("❌ Error in cron job:", error);
      }
    }, { timezone: "Asia/Kolkata" });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend served at: http://localhost:${PORT}`);
      console.log(`🔧 API test endpoint: http://localhost:${PORT}/api/test`);
      console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });