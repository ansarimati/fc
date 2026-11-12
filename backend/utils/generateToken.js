const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for a given user ID.
 */

const generateToken = (userId, role = "user") => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export default generateToken;