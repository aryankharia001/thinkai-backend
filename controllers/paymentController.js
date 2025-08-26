const Razorpay = require('razorpay');
const User = require('../models/UserModel');
const crypto = require('crypto');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Simple create order without auth requirement
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid amount is required" 
      });
    }

    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    console.log("Creating Razorpay order with options:", options);

    const order = await instance.orders.create(options);
    
    console.log("Razorpay order created successfully:", order);
    
    res.status(200).json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create order"
    });
  }
};

// ✅ Payment verification and user update
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planType,
      amount
    } = req.body;

    console.log("Verifying payment:", { razorpay_order_id, razorpay_payment_id, userId, planType, amount });

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Payment signature verification failed");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }

    console.log("✅ Payment signature verified successfully");

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("Found user:", user.username, "Current totalPaid:", user.totalPaid);

    // Add to payment history
    const paymentRecord = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: Number(amount),
      currency: "INR",
      status: "paid",
      paidAt: new Date(),
      planType: planType || (amount >= 1000 ? "pro" : "basic")
    };

    user.paymentHistory.push(paymentRecord);

    // Update total paid amount
    user.totalPaid = (user.totalPaid || 0) + Number(amount);

    // Update legacy payment details for backward compatibility
    user.paymentDetails = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: user.totalPaid, // Total amount paid so far
      currency: "INR",
      status: "paid",
      paidAt: new Date()
    };

    // Save user (this will trigger the pre-save middleware to update subscription tier)
    await user.save();

    console.log("✅ User updated successfully:", {
      username: user.username,
      totalPaid: user.totalPaid,
      subscriptionTier: user.subscriptionTier,
      hasPaid: user.hasPaid
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and user updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalPaid: user.totalPaid,
        subscriptionTier: user.subscriptionTier,
        hasPaid: user.hasPaid,
        paymentDetails: user.paymentDetails
      }
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Payment verification failed"
    });
  }
};