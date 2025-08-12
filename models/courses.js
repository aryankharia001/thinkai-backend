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
    type: String,
    default: ""
  },
  // ✅ Price determines access tier
  price: {
    type: Number,
    default: 0, // 0 = free for logged users, 200 = basic tier, 800+ = premium tier
    min: 0
  },
  // ✅ Access tier for easy filtering
  accessTier: {
    type: String,
    enum: ["free", "basic", "premium"],
    default: "free"
  },
  duration: {
    type: String,
    default: ""
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ✅ Course modules/content structure
  modules: [{
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String },
    duration: { type: String }, // e.g., "15 minutes"
    order: { type: Number, default: 0 },
    isPreview: { type: Boolean, default: false } // First module can be free preview
  }],
  // ✅ Course stats
  enrolledCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Pre-save middleware to set access tier based on price
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set access tier based on price
  if (this.price === 0) {
    this.accessTier = "free";
  } else if (this.price <= 200) {
    this.accessTier = "basic";
  } else {
    this.accessTier = "premium";
  }
  
  next();
});

// ✅ Static method to get courses by access level
courseSchema.statics.getCoursesByAccessLevel = function(userTotalPaid) {
  const query = { isActive: true };
  
  if (userTotalPaid >= 1000) {
    // Premium user - can access all courses
    return this.find(query);
  } else if (userTotalPaid >= 200) {
    // Basic user - can access free and basic courses
    return this.find({ ...query, price: { $lte: 200 } });
  } else {
    // Free user - can access only free courses
    return this.find({ ...query, price: 0 });
  }
};

module.exports = mongoose.model("Course", courseSchema);