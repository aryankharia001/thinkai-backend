const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  // ✅ Updated payment system for 3-tier access
  totalPaid: {
    type: Number,
    default: 0 // Total amount paid by user
  },
  hasPaid: {
    type: Boolean,
    default: false // Kept for backward compatibility
  },
  subscriptionTier: {
    type: String,
    enum: ["basic", "intermediate", "premium"],
    default: "basic" // Basic is free after login
  },
  paymentHistory: [{
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    paidAt: { type: Date },
    planType: { type: String } // "intermediate", "premium", or "upgrade"
  }],
  // Legacy field - keeping for backward compatibility
  paymentDetails: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    paidAt: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Method to check course access based on user's tier
userSchema.methods.canAccessCourse = function(course) {
  const tierHierarchy = {
    "basic": 1,
    "intermediate": 2,
    "premium": 3
  };
  
  const courseTierLevel = tierHierarchy[course.accessTier] || 1;
  const userTierLevel = tierHierarchy[this.subscriptionTier] || 1;
  
  return userTierLevel >= courseTierLevel;
};

// ✅ Method to get required payment amount for a specific tier
userSchema.methods.getRequiredPaymentForTier = function(targetTier) {
  const tierPrices = {
    "basic": 0,         // Free after login
    "intermediate": 200, // ₹200 for intermediate
    "premium": 500      // ₹500 for premium
  };
  
  const targetPrice = tierPrices[targetTier] || 0;
  return Math.max(0, targetPrice - this.totalPaid);
};

// ✅ Method to get required tier for a course
userSchema.methods.getRequiredTierForCourse = function(course) {
  if (this.canAccessCourse(course)) {
    return null; // User already has access
  }
  return course.accessTier;
};

// ✅ Method to update subscription tier based on total paid
userSchema.methods.updateSubscriptionTier = function() {
  if (this.totalPaid >= 500) {
    this.subscriptionTier = "premium";
    this.hasPaid = true;
  } else if (this.totalPaid >= 200) {
    this.subscriptionTier = "intermediate";
    this.hasPaid = true;
  } else {
    this.subscriptionTier = "basic"; // Basic is free for logged-in users
    this.hasPaid = false;
  }
};

// ✅ Pre-save middleware to update tier automatically
userSchema.pre('save', function(next) {
  this.updateSubscriptionTier();
  next();
});

// ✅ Virtual to get user's accessible courses
userSchema.virtual('accessibleCourseTiers').get(function() {
  switch(this.subscriptionTier) {
    case "premium":
      return ["basic", "intermediate", "premium"];
    case "intermediate":
      return ["basic", "intermediate"];
    default: // "basic"
      return ["basic"];
  }
});

module.exports = mongoose.model("User", userSchema);