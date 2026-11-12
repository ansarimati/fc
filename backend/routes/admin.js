const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth");

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  getAdminProductById,
} = require("../controllers/productController");

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminCategories,
} = require("../controllers/categoryController");

const {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updatePaymentStatus,
  refundOrder,
} = require("../controllers/adminOrderController");

const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  updateUserRole,
} = require("../controllers/adminUserController");

const {
  getDashboardStats,
  getLowStockProducts,
  getOutOfStockProducts,
} = require("../controllers/dashBoardController");

// All admin routes require login + admin role
router.use(protect, adminOnly);

// ─── Products ───────────────────────────────────────────────
router.get("/products",          getAdminProducts);
router.get("/products/:id",      getAdminProductById);
router.post("/products",         createProduct);
router.put("/products/:id",      updateProduct);
router.delete("/products/:id",   deleteProduct);

// ─── Categories ─────────────────────────────────────────────
router.get("/categories",        getAdminCategories);
router.post("/categories",       createCategory);
router.put("/categories/:id",    updateCategory);
router.delete("/categories/:id", deleteCategory);

// ─── Orders ─────────────────────────────────────────────────
router.get("/orders",                    getAllOrders);
router.get("/orders/:id",                getOrderByIdAdmin);
router.put("/orders/:id/status",         updateOrderStatus);
router.put("/orders/:id/payment-status", updatePaymentStatus);
router.put("/orders/:id/refund",         refundOrder);

// ─── Users ──────────────────────────────────────────────────
router.get("/users",                    getAllUsers);
router.get("/users/:id",                getUserById);
router.put("/users/:id/toggle-status",  toggleUserStatus);
router.put("/users/:id/role",           updateUserRole);

// ─── Dashboard ──────────────────────────────────────────────
router.get("/dashboard/stats",         getDashboardStats);
router.get("/dashboard/low-stock",     getLowStockProducts);
router.get("/dashboard/out-of-stock",  getOutOfStockProducts);

module.exports = router;