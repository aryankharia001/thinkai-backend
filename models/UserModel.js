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
  // ✅ Updated payment system for tiered access
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
    enum: ["free", "basic", "premium"], // free: 0, basic: 200+, premium: 1000+
    default: "free"
  },
  paymentHistory: [{
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    paidAt: { type: Date },
    planType: { type: String } // "basic" or "premium" or "upgrade"
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

// ✅ Method to check course access based on price and user's tier
userSchema.methods.canAccessCourse = function(coursePrice) {
  if (coursePrice === 0) return true; // Free courses for all logged-in users
  if (coursePrice <= 200 && this.totalPaid >= 200) return true; // Basic tier
  if (coursePrice > 200 && this.totalPaid >= 1000) return true; // Premium tier
  return false;
};

// ✅ Method to get required payment amount for a course
userSchema.methods.getRequiredPayment = function(coursePrice) {
  if (coursePrice === 0) return 0; // Free course
  if (coursePrice <= 200) {
    return Math.max(0, 200 - this.totalPaid); // Need at least 200 total
  } else {
    return Math.max(0, 1000 - this.totalPaid); // Need at least 1000 total
  }
};

// ✅ Method to update subscription tier based on total paid
userSchema.methods.updateSubscriptionTier = function() {
  if (this.totalPaid >= 1000) {
    this.subscriptionTier = "premium";
    this.hasPaid = true;
  } else if (this.totalPaid >= 200) {
    this.subscriptionTier = "basic";
    this.hasPaid = true;
  } else {
    this.subscriptionTier = "free";
    this.hasPaid = false;
  }
};

// ✅ Pre-save middleware to update tier automatically
userSchema.pre('save', function(next) {
  this.updateSubscriptionTier();
  next();
});

module.exports = mongoose.model("User", userSchema);