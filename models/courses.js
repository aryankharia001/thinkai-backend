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
    default: 0, // 0 = basic, 200 = intermediate, 1000+ = pro
    min: 0
  },
  // ✅ Access tier for easy filtering
  accessTier: {
    type: String,
    enum: ["basic", "intermediate", "pro"],
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
    isPreview: { type: Boolean, default: false } // First module can be basic preview
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

// ✅ Pre-save middleware to set access tier based on price - UPDATED PRICING
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set access tier based on price - FIXED PRICING TO MATCH FRONTEND
  if (this.price === 0) {
    this.accessTier = "basic"; // Free courses are basic tier
  } else if (this.price <= 200) {
    this.accessTier = "intermediate"; // ₹200 or less = intermediate
  } else {
    this.accessTier = "pro"; // More than ₹200 = pro (₹1000 plan)
  }
  
  next();
});

// ✅ Static method to get courses by user's subscription level
courseSchema.statics.getCoursesByUserTier = function(userSubscriptionTier) {
  const query = { isActive: true };
  
  // Map subscription tiers to accessible course tiers
  const subscriptionToAccessMapping = {
    "basic": ["basic"],
    "intermediate": ["basic", "intermediate"],
    "pro": ["basic", "intermediate", "pro"],
    // Handle legacy tiers
    "basic": ["basic"],
    "intermediate": ["basic", "intermediate"],
    "pro": ["basic", "intermediate", "pro"]
  };
  
  const accessibleTiers = subscriptionToAccessMapping[userSubscriptionTier] || ["basic"];
  
  return this.find({ 
    ...query, 
    accessTier: { $in: accessibleTiers } 
  });
};

// ✅ Method to check if user can access specific course
courseSchema.methods.canUserAccess = function(userSubscriptionTier) {
  // Map subscription tiers to access levels
  const subscriptionToAccessMapping = {
    "basic": "basic",
    "intermediate": "intermediate",
    "pro": "pro",
    // Handle legacy tiers
    "basic": "basic",
    "intermediate": "intermediate", 
    "pro": "pro"
  };
  
  const userAccessTier = subscriptionToAccessMapping[userSubscriptionTier] || "basic";
  
  const tierHierarchy = {
    "basic": 1,
    "intermediate": 2,
    "pro": 3
  };
  
  const courseTierLevel = tierHierarchy[this.accessTier] || 1;
  const userTierLevel = tierHierarchy[userAccessTier] || 1;
  
  return userTierLevel >= courseTierLevel;
};

module.exports = mongoose.model("Course", courseSchema);