const mongoose = require("mongoose");

const aiNewsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  headlines: [
    {
      title: { type: String, required: true },
      description: { type: String },
      url: { type: String },
      publishedAt: { type: Date },
    },
  ],
});

// ✅ Optional validation: make sure you don’t store more than 30 headlines
aiNewsSchema.path("headlines").validate(function (arr) {
  return arr.length <= 30;
}, "Cannot store more than 30 headlines");

module.exports = mongoose.model("AINews", aiNewsSchema);