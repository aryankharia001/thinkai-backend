const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  date: {
    type: Date,
    unique: true, // Only one document per day
    default: () => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0); // Normalize to start of the day in UTC
      return d;
    }
  },
  headlines: {
    type: [String], // Array of headline titles as strings
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
    default: []
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

function arrayLimit(val) {
  return val.length <= 5;
}

// ❌ Removed duplicate `newsSchema.index({ date: 1 })` 
// because `unique: true` already creates an index.

// Pre-save middleware to ensure date is always start of day in UTC
newsSchema.pre('save', function(next) {
  if (this.date) {
    this.date.setUTCHours(0, 0, 0, 0);
  }
  next();
});

const News = mongoose.model("News", newsSchema);
module.exports = News;