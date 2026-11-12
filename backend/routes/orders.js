const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");

const {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  createCODOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
} = require("../controllers/orderController");

router.use(protect); // all order routes require login

router.post("/create-razorpay-order", createRazorpayOrder);
router.post("/verify-payment",        verifyPaymentAndCreateOrder);
router.post("/cod",                   createCODOrder);
router.get("/",                       getMyOrders);
router.get("/track/:orderNumber",     trackOrder);
router.get("/:id",                    getOrderById);
router.put("/:id/cancel",             cancelOrder);

export default router;