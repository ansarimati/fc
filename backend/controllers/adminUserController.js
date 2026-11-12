const User          = require("../models/User");
const Order         = require("../models/Order");
const asyncHandler  = require("../middleware/asyncHandler");

// ─── @desc Get all users (admin) with search + filters ──────────
// @route GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, status } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      data: users.map((u) => u.toSafeObject()),
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    },
  });
});

// ─── @desc Get single user with order history ───────────────────
// @route GET /api/admin/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const orders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  const orderStats = await Order.aggregate([
    { $match: { user: user._id, paymentStatus: "paid" } },
    { $group: { _id: null, totalSpent: { $sum: "$total" }, totalOrders: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      user: user.toSafeObject(),
      recentOrders: orders,
      stats: orderStats[0] || { totalSpent: 0, totalOrders: 0 },
    },
  });
});

// ─── @desc Toggle user active/inactive (ban/unban) ──────────────
// @route PUT /api/admin/users/:id/toggle-status
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot deactivate an admin account");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: { user: user.toSafeObject() },
  });
});

// ─── @desc Promote/demote user role ──────────────────────────────
// @route PUT /api/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: { user: user.toSafeObject() },
  });
});