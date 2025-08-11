import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  date: {
    type: Date,
    unique: true, // Only one document per day
    default: () => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0); // Use UTC to avoid timezone issues
      return d;
    }
  },
  headlines: {
    type: [String], // Array of headline titles as strings
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

function arrayLimit(val) {
  return val.length <= 5;
}

// Index on date for faster queries
newsSchema.index({ date: 1 });

// Pre-save middleware to ensure date is always start of day in UTC
newsSchema.pre('save', function(next) {
  if (this.date) {
    this.date.setUTCHours(0, 0, 0, 0);
  }
  next();
});

const News = mongoose.model("News", newsSchema);
export default News;