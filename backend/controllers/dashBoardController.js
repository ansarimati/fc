const Order        = require("../models/Order");
const Product      = require("../models/Product");
const User         = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

// ─── @desc Get dashboard overview stats ──────────────────────────
// @route GET /api/admin/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalRevenueAgg,
    thisMonthRevenueAgg,
    lastMonthRevenueAgg,
    totalOrders,
    thisMonthOrders,
    lastMonthOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    topProductsAgg,
    ordersByStatusAgg,
    salesChartAgg,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: "user" }),
    Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5),
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]),
    Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue     = totalRevenueAgg[0]?.total || 0;
  const thisMonthRevenue = thisMonthRevenueAgg[0]?.total || 0;
  const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;

  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : thisMonthRevenue > 0 ? 100 : 0;

  const ordersChange = lastMonthOrders > 0
    ? Math.round(((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
    : thisMonthOrders > 0 ? 100 : 0;

  const ordersByStatus = ordersByStatusAgg.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const topProducts = topProductsAgg.map((item) => ({
    ...item.product,
    sold: item.sold,
    revenue: item.revenue,
  }));

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      revenueChange,
      ordersChange,
      recentOrders,
      topProducts,
      salesChart: salesChartAgg.map((d) => ({
        date: d._id,
        revenue: d.revenue,
        orders: d.orders,
      })),
      ordersByStatus,
    },
  });
});

// ─── @desc Get low stock products (admin alert) ──────────────────
// @route GET /api/admin/dashboard/low-stock
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || 5;

  const products = await Product.find({
    isActive: true,
    $or: [
      { stock: { $lte: threshold, $gt: 0 } },
      { "variants.stock": { $lte: threshold, $gt: 0 } },
    ],
  }).select("name images stock variants sku");

  res.json({ success: true, data: { products } });
});

// ─── @desc Get out-of-stock products ─────────────────────────────
// @route GET /api/admin/dashboard/out-of-stock
export const getOutOfStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    stock: 0,
    $or: [{ variants: { $size: 0 } }, { "variants.stock": { $not: { $gt: 0 } } }],
  }).select("name images stock sku");

  res.json({ success: true, data: { products } });
});