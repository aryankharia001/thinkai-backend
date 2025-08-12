const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// ========== SIGN UP ==========
exports.SignUp = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password || !email)
    return res.status(400).json({ status: 400, message: "Need all credentials" });

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ status: 400, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ status: 201, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Error in signup" });
  }
};

// ========== SIGN IN - FIXED TO INCLUDE SUBSCRIPTION DATA ==========
exports.SignIn = async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email)
    return res.status(400).json({ status: 400, message: "Need all credentials" });

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(404).json({ status: 404, message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect)
      return res.status(401).json({ status: 401, message: "Invalid credentials" });

    // ✅ FIX: Use consistent JWT_SECRET environment variable
    const token = jwt.sign(
      { 
        userId: existingUser._id, 
        id: existingUser._id, // Added for consistency with middleware
        email: existingUser.email, 
        role: existingUser.role 
      },
      process.env.JWT_SECRET, // ✅ Changed from JWT_TOKEN to JWT_SECRET
      { expiresIn: "1d" }
    );

    res.setHeader("Authorization", `Bearer ${token}`);

    // ✅ CRITICAL FIX: Include ALL user data including subscription info
    const userResponse = {
      id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
      // ✅ ADDED: Include subscription fields
      subscriptionTier: existingUser.subscriptionTier,
      totalPaid: existingUser.totalPaid,
      hasPaid: existingUser.hasPaid,
      paymentHistory: existingUser.paymentHistory,
      createdAt: existingUser.createdAt
    };

    console.log("✅ Login successful with full user data:", {
      username: userResponse.username,
      subscriptionTier: userResponse.subscriptionTier,
      totalPaid: userResponse.totalPaid
    });

    res.status(200).json({
      status: 200,
      message: "Logged in successfully",
      token,
      user: userResponse
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ status: 500, message: "Error in signin" });
  }
};

// ========== GET ME ==========
const getMe = async (req, res) => {
  try {
    // req.user.id comes from your verifyToken middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ ALSO FIX: Include subscription data in getMe
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      totalPaid: user.totalPaid,
      hasPaid: user.hasPaid,
      paymentHistory: user.paymentHistory,
      createdAt: user.createdAt
    };

    res.json({ status: 200, user: userResponse });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ FIX: Proper module exports
module.exports = {
  SignUp: exports.SignUp,
  SignIn: exports.SignIn,
  getMe
};