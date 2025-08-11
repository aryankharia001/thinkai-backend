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
    const existingUser = await User.findOne({ email }); // ✅ FIX: Use `User`, not `user`

    if (existingUser)
      return res.status(400).json({ status: 400, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username: username, email, password: hashedPassword }); // ✅ Assuming 'userusername' in schema
    await newUser.save();

    res.status(201).json({ status: 201, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Error in signup" });
  }
};

// ========== SIGN IN ==========
exports.SignIn = async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email)
    return res.status(400).json({ status: 400, message: "Need all credentials" });

  try {
    const existingUser = await User.findOne({ email }); // ✅ FIX: Use `User`, not `user`
    if (!existingUser)
      return res.status(404).json({ status: 404, message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect)
      return res.status(401).json({ status: 401, message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_TOKEN,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      status: 200,
      message: "Logged in successfully",
      token,
      user: {
        id: existingUser._id,
        username: existingUser.username, // ✅ 'userusername' if your schema uses that
        email: existingUser.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Error in signin" });
  }
};
