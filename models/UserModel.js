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
    enum: ["basic", "intermediate", "pro"], // Updated to match frontend
    default: "basic" // Free tier for new users
  },
  paymentHistory: [{
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    paidAt: { type: Date },
    planType: { type: String } // "intermediate", "pro", or "upgrade"
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
  // Map subscription tiers to course access tiers
  const subscriptionToAccessMapping = {
    "basic": "basic",
    "intermediate": "intermediate", 
    "pro": "pro"
  };
  
  const userAccessTier = subscriptionToAccessMapping[this.subscriptionTier] || "basic";
  
  const tierHierarchy = {
    "basic": 1,
    "intermediate": 2,
    "pro": 3
  };
  
  const courseTierLevel = tierHierarchy[course.accessTier] || 1;
  const userTierLevel = tierHierarchy[userAccessTier] || 1;
  
  return userTierLevel >= courseTierLevel;
};

// ✅ Method to get required payment amount for a specific tier
userSchema.methods.getRequiredPaymentForTier = function(targetTier) {
  const tierPrices = {
    "basic": 0,        // Free tier
    "intermediate": 200,   // ₹200 for intermediate (intermediate access)
    "pro": 1000       // ₹1000 for pro (pro access) - FIXED FROM 500 TO 1000
  };
  
  const targetPrice = tierPrices[targetTier] || 0;
  return Math.max(0, targetPrice - this.totalPaid);
};

// ✅ Method to get required tier for a course
userSchema.methods.getRequiredTierForCourse = function(course) {
  if (this.canAccessCourse(course)) {
    return null; // User already has access
  }
  
  // Map course access tier back to subscription tier
  const accessToSubscriptionMapping = {
    "basic": "basic",
    "intermediate": "intermediate",
    "pro": "pro"
  };
  
  return accessToSubscriptionMapping[course.accessTier] || "intermediate";
};

// ✅ Method to update subscription tier based on total paid - FIXED PRICING
userSchema.methods.updateSubscriptionTier = function() {
  if (this.totalPaid >= 1000) { // CHANGED FROM 500 TO 1000
    this.subscriptionTier = "pro";
    this.hasPaid = true;
  } else if (this.totalPaid >= 200) {
    this.subscriptionTier = "intermediate";
    this.hasPaid = true;
  } else {
    this.subscriptionTier = "basic"; // Free tier for users who haven't paid
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
    case "pro":
      return ["basic", "intermediate", "pro"];
    case "intermediate":
      return ["basic", "intermediate"];
    default: // "basic"
      return ["basic"];
  }
});

// ✅ Virtual to get user's access tier for course checking
userSchema.virtual('accessTier').get(function() {
  const mapping = {
    "basic": "basic",
    "intermediate": "intermediate",
    "pro": "pro"
  };
  return mapping[this.subscriptionTier] || "basic";
});

module.exports = mongoose.model("User", userSchema);