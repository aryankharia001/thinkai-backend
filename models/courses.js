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
  price: {
    type: Number,
    required: [true, "Course price is required"],
    min: 0
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/400x250"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Course", courseSchema);
