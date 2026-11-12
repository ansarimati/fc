const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    require: true,
    trim: true
  },
  phone: {
    type: String,
    require: true,
    match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"],
  },
  line1: {
    type: String,
    require: true,
    trim: true
  },
  line2: {
    type: String,
    require: true,
    trim: true
  },
  city: {
    type: String,
    require: true,
    trim: true
  },
  state: {
    type: String,
    require: true,
    trim: true
  },
  pincode: {
    type: String,
    require: true,
    match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"],
  },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

const userSchema = new mongooses.Schema({
  name: {
    type: String,
    require: [true, "Name is required"],
    trim: true,
    maxLength: [60, "Name can not exceed 60 characters"]
  },
  email: {
    type: String,
    require: [true, "Email is required"],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    minLength: [8, "Password must be at least 8 characters"],
    select: false
  },
  provider: {
    type: String,
    enum: ["credentials", "google"],
    default: "credentials"
  },
  googleID: { type: String, select: false },
  avatar: { type: String, default: "" },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"],
  },
  addresses: {
    addressSchema
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  otp: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: String, select: false },
  lastLogin: { type: Date }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.role({ role: 1 });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
}

// Instance method: get default address
userSchema.methods.getDefaultAddress = function () {
  return this.addresses.find((addr) => addr.isDefault) || this.addr[0];
}

// Ensure only one default address
userSchema.methods.setDefaultAddress = function (addressId) {
  this.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  })
}

// Remove sensitive info from JSON output
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.resetPasswordExpires;
  delete obj.resetPasswordToken;
  delete obj.googleID;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;