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
  hasPaid: {
    type: Boolean,
    default: false
  },
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

module.exports = mongoose.model("User", userSchema);