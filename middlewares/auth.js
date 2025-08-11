const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Middleware to verify token and set req.user
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid token." });
  }
};

// Middleware to allow only admins
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// Middleware to allow only users
const isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ error: "Access denied. Users only." });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isUser };
