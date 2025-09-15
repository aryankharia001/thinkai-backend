const mongoose = require("mongoose");

const aiNewsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  headlines: {
    type: [String],
    validate: [arr => arr.length <= 30, "Cannot store more than 30 headlines"],
    required: true,
  },
});

module.exports = mongoose.model("AINews", aiNewsSchema);