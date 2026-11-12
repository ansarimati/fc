const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies JWT and attaches the user to req.user
 */

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split[" "][1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided"
      });
    }

    const decoded = jwt.verify(token , process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no user found"
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account had been deactivated, please contact support",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
}

// Restrict routes access to admin only, User after Protect
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  next();
};

/**
 * Optional auth — attaches user if token exists, but doesn't fail if missing.
 * Useful for routes like product listing where guests can browse too.
 */

export const optionalAuth = async () => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
    next();
  } catch (err) {
    next();
  }
}