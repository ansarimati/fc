const Order        = require("../models/Order");
const Product      = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { sendEmail } = require("../utils/sendEmail");

// ─── @desc Get all orders (admin) with filters ────────────────
// @route GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    search,
    fromDate,
    toDate,
  } = req.query;

  const query = {};
  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (search) query.orderNumber = { $regex: search, $options: "i" };
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      data: orders,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    },
  });
});

// ─── @desc Get single order (admin) ────────────────────────────
// @route GET /api/admin/orders/:id
export const getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("items.product", "name images slug");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({ success: true, data: { order } });
});

// ─── @desc Update order status + add tracking event ────────────
// @route PUT /api/admin/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message, location, trackingNumber } = req.body;

  const validStatuses = [
    "pending", "confirmed", "processing", "shipped",
    "out_for_delivery", "delivered", "cancelled", "refunded",
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === "delivered") {
    order.deliveredAt = new Date();
    if (order.paymentMethod === "cod") order.paymentStatus = "paid";
  }
  if (status === "cancelled") {
    order.cancelledAt = new Date();
  }

  const defaultMessages = {
    pending:           "Order is pending confirmation",
    confirmed:         "Order has been confirmed",
    processing:        "Order is being processed and packed",
    shipped:           "Order has been shipped",
    out_for_delivery:  "Order is out for delivery",
    delivered:         "Order has been delivered successfully",
    cancelled:         "Order has been cancelled",
    refunded:          "Order amount has been refunded",
  };

  order.addTrackingEvent(status, message || defaultMessages[status], location);
  await order.save();

  // Notify customer via email on key status changes
  if (["shipped", "out_for_delivery", "delivered", "cancelled"].includes(status)) {
    await sendEmail({
      to: order.user.email,
      subject: `Order Update — ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color:#2563eb;">TechBazaar</h2>
          <p>Hi ${order.user.name},</p>
          <p>Your order <strong>${order.orderNumber}</strong> status has been updated:</p>
          <h3 style="color:#16a34a;">${message || defaultMessages[status]}</h3>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
        </div>
      `,
    });
  }

  res.json({ success: true, message: "Order status updated successfully", data: { order } });
});

// ─── @desc Update payment status manually (e.g. mark COD as paid) ─
// @route PUT /api/admin/orders/:id/payment-status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const validStatuses = ["pending", "paid", "failed", "refunded"];

  if (!validStatuses.includes(paymentStatus)) {
    res.status(400);
    throw new Error("Invalid payment status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  res.json({ success: true, message: "Payment status updated", data: { order } });
});

// ─── @desc Admin cancels/refunds an order + restocks ────────────
// @route PUT /api/admin/orders/:id/refund
export const refundOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = "refunded";
  order.paymentStatus = "refunded";
  order.cancelReason = reason || "Refunded by admin";
  order.addTrackingEvent("refunded", `Order refunded: ${order.cancelReason}`);

  // Restock items
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (variant) variant.stock += item.quantity;
    } else {
      product.stock += item.quantity;
    }
    await product.save();
  }

  await order.save();

  res.json({ success: true, message: "Order refunded successfully", data: { order } });
});