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
    default: 0, // 0 = basic, 200 = intermediate, 500+ = premium
    min: 0
  },
  // ✅ Access tier for easy filtering
  accessTier: {
    type: String,
    enum: ["basic", "intermediate", "premium"],
    default: "basic"
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
    this.accessTier = "basic"; // Free courses are basic tier
  } else if (this.price <= 200) {
    this.accessTier = "intermediate";
  } else {
    this.accessTier = "premium";
  }
  
  next();
});

// ✅ Static method to get courses by user's subscription level
courseSchema.statics.getCoursesByUserTier = function(userTier) {
  const query = { isActive: true };
  
  switch(userTier) {
    case "premium":
      // Premium users can access all courses
      return this.find(query);
    case "intermediate":
      // Intermediate users can access basic and intermediate courses
      return this.find({ 
        ...query, 
        accessTier: { $in: ["basic", "intermediate"] } 
      });
    default: // "basic"
      // Basic users (logged-in) can access only basic courses
      return this.find({ ...query, accessTier: "basic" });
  }
};

// ✅ Method to check if user can access specific course
courseSchema.methods.canUserAccess = function(userTier) {
  const tierHierarchy = {
    "basic": 1,
    "intermediate": 2,
    "premium": 3
  };
  
  const courseTierLevel = tierHierarchy[this.accessTier] || 1;
  const userTierLevel = tierHierarchy[userTier] || 1;
  
  return userTierLevel >= courseTierLevel;
};

module.exports = mongoose.model("Course", courseSchema);