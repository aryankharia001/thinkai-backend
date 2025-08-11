import express from 'express';
import cors from 'cors';
import headlinesRouter from './routes/headlines.js';
import cron from 'node-cron';
import mongoose from 'mongoose';
import { fetchHeadlines } from './controllers/headlinesController.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', headlinesRouter);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");

  // Cron every 12:00 AM but API will only be called once/day
  cron.schedule('0 0 * * *', async () => {
    console.log("⏳ Cron job triggered — fetching headlines...");
    await fetchHeadlines();
  }, { timezone: "Asia/Kolkata" });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
});