const Razorpay = require('razorpay');
const User = require('../models/UserModel');
const crypto = require('crypto');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ Get available payment plans for user
exports.getPaymentPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const plans = [];
    
    // Basic Plan (₹200) - if user hasn't paid anything or paid less than 200
    if (user.totalPaid < 200) {
      plans.push({
        id: "basic",
        name: "Basic Plan",
        price: 200 - user.totalPaid,
        originalPrice: 200,
        features: [
          "Access to all free courses",
          "Access to basic tier courses (up to ₹200)",
          "Community support",
          "Basic resources"
        ],
        tier: "basic"
      });
    }

    // Premium Plan (₹1000) - if user hasn't reached premium
    if (user.totalPaid < 1000) {
      const premiumPrice = 1000 - user.totalPaid;
      plans.push({
        id: "premium",
        name: "Premium Plan",
        price: premiumPrice,
        originalPrice: 1000,
        features: [
          "Access to ALL courses",
          "Premium content and resources",
          "Priority support",
          "Downloadable materials",
          "Lifetime access"
        ],
        tier: "premium",
        recommended: true
      });
    }

    res.status(200).json({
      success: true,
      currentTier: user.subscriptionTier,
      totalPaid: user.totalPaid,
      plans
    });
  } catch (error) {
    console.error("❌ Error fetching payment plans:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body; // "basic" or "premium"
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let amount = 0;
    let planType = "";

    // Calculate amount based on plan and user's current payment
    if (planId === "basic" && user.totalPaid < 200) {
      amount = 200 - user.totalPaid;
      planType = "basic";
    } else if (planId === "premium" && user.totalPaid < 1000) {
      amount = 1000 - user.totalPaid;
      planType = "premium";
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid plan or plan already purchased" 
      });
    }

    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: userId,
        planType: planType,
        upgradeAmount: amount
      }
    };

    const order = await instance.orders.create(options);
    
    res.status(200).json({ 
      success: true, 
      order,
      planType,
      amount 
    });
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Verify payment and update user
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planType,
      amount 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }

    // Update user payment details
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Add to payment history
    user.paymentHistory.push({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: Number(amount),
      status: "paid",
      paidAt: new Date(),
      planType
    });

    // Update total paid amount
    user.totalPaid += Number(amount);

    // Update legacy payment details for backward compatibility
    user.paymentDetails = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: user.totalPaid, // Total amount paid
      status: "paid",
      paidAt: new Date()
    };

    await user.save(); // This will trigger the pre-save middleware to update tier

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      user: {
        totalPaid: user.totalPaid,
        subscriptionTier: user.subscriptionTier,
        hasPaid: user.hasPaid
      }
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user's payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      paymentStatus: {
        totalPaid: user.totalPaid,
        subscriptionTier: user.subscriptionTier,
        hasPaid: user.hasPaid,
        paymentHistory: user.paymentHistory
      }
    });
  } catch (error) {
    console.error("❌ Error fetching payment status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};