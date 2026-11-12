const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../middleware/asyncHandler");
const { sendEmail, emailTemplates, } = require("../utils/sendEmail");
const { validateEmail, validatePassword, generateOTP } = require("../utils/validators");

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email, !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    );
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const otp = generateOTP();
  const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000 );

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    provider: "credentials",
    otp,
    otpExpiresIn
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your TechBazaar account",
    html: emailTemplates.otpVerification(user.name, otp),
  });

  res.status(201).json({
    success: true,
    message: "Registration successful. Please verify your email with the OTP sent.",
    data: { userId: user._id, email: user.email },
  });
})

// @route POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select("+otp +otpExpires");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("Account already verified");
  }

  if (!user.otp || user.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  if (user.otpExpires < new Date()) {
    res.status(400);
    throw new Error("OTP has expired. Please request a new one.");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: "Email verified successfully",
    data: { token, user: user.toSafeObject() },
  });
});

// @route POST /api/auth/resend-otp
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("Account already verified");
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your new TechBazaar OTP",
    html: emailTemplates.otpVerification(user.name, otp),
  });

  res.json({ success: true, message: "OTP resent successfully" });
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || user.provider !== "credentials") {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isVerified) {
    res.status(403);
    throw new Error("Please verify your email before logging in");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been deactivated. Contact support.");
  }
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: "Login successful",
    data: { token, user: user.toSafeObject() },
  });
});

// @route POST /api/auth/google
export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, avatar, googleId } = req.body;

  if (!email || !googleId) {
    res.status(400);
    throw new Error("Missing Google account details");
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    // Existing user — link Google if not already linked
    if (user.provider === "credentials" && !user.googleId) {
      user.googleId = googleId;
      user.avatar = user.avatar || avatar;
    }
    user.lastLogin = new Date();
    await user.save();
  } else {
    // New user via Google
    user = await User.create({
      name,
      email: email.toLowerCase(),
      avatar,
      googleId,
      provider: "google",
      isVerified: true, // Google already verified the email
      lastLogin: new Date(),
    });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    message: "Google authentication successful",
    data: { token, user: user.toSafeObject() },
  });
});

// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration attacks
  if (!user || user.provider !== "credentials") {
    return res.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your TechBazaar password",
    html: emailTemplates.resetPassword(user.name, resetUrl),
  });

  res.json({
    success: true,
    message: "If an account exists with this email, a reset link has been sent.",
  });
});

// @route POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    );
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successful. Please login with your new password.",
  });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user.toSafeObject() },
  });
});

// @route PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (user.provider !== "credentials") {
    res.status(400);
    throw new Error("Cannot change password for social login accounts");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  if (!validatePassword(newPassword)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    );
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
});