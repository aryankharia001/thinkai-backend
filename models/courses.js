const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Course title is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Course description is required"],
    trim: true
  },
  image: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Course", courseSchema);
