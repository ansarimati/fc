const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");

const { register, verifyOtp, resendOtp, login, googleAuth, forgotPassword, resetPassword, getMe, changePassword } = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resent-otp", resendOtp);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

export default router;