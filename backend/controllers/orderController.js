const crypto        = require("crypto");
const Order         = require("../models/Order");
const Cart          = require("../models/Cart");
const Product        = require("../models/Product");
const razorpay       = require("../config/razorpay");
const asyncHandler   = require("../middleware/asyncHandler");
const { sendEmail, emailTemplates } = require("../utils/sendEmail");

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_CHARGE    = 99;
const TAX_RATE           = 0; // GST assumed included in product price; adjust if needed

/** Helper: build order items from cart + validate stock */
export const buildOrderItemsFromCart = async (cart) => {
  await cart.populate("items.product");
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new Error(`A product in your cart is no longer available`);
    }

    let price = item.price;
    let variantName = "";
    let availableStock = product.stock;

    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new Error(`A product variant in your cart is no longer available`);
      price = variant.price;
      variantName = variant.name;
      availableStock = variant.stock;
    }

    if (availableStock < item.quantity) {
      throw new Error(`${product.name} has only ${availableStock} unit(s) left in stock`);
    }

    orderItems.push({
      product:     product._id,
      variantId:   item.variantId || null,
      name:        product.name,
      image:       product.images[0],
      variantName,
      price,
      quantity:    item.quantity,
    });
  }

  return orderItems;
};

/** Helper: decrement stock after successful order */
export const decrementStock = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (variant) variant.stock = Math.max(0, variant.stock - item.quantity);
    } else {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
    product.totalSold = (product.totalSold || 0) + item.quantity;
    await product.save();
  }
};

// ─── @desc Create a Razorpay order (step 1 of online payment) ───
// @route POST /api/orders/create-razorpay-order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  const orderItems = await buildOrderItemsFromCart(cart);
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = cart.discount || 0;
  const shippingCharge = subtotal - discount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + shippingCharge + tax);

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    notes: { userId: req.user._id.toString() },
  });

  res.json({
    success: true,
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      breakdown: { subtotal, discount, shippingCharge, tax, total },
    },
  });
});

// ─── @desc Verify Razorpay payment + create Order (step 2) ──────
// @route POST /api/orders/verify-payment
export const verifyPaymentAndCreateOrder = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingAddress,
    notes,
  } = req.body;

  // ─── Verify signature ──────────────────────────────────────
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed. Signature mismatch.");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  const orderItems = await buildOrderItemsFromCart(cart);
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = cart.discount || 0;
  const shippingCharge = subtotal - discount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + shippingCharge + tax);

  const orderNumber = await Order.generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    razorpayOrderId:   razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    orderStatus: "confirmed",
    subtotal,
    discount,
    shippingCharge,
    tax,
    total,
    couponCode: cart.couponCode,
    notes,
    trackingEvents: [
      { status: "confirmed", message: "Order placed and payment received successfully" },
    ],
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
  });

  await decrementStock(orderItems);

  // Clear cart
  cart.items = [];
  cart.couponCode = null;
  cart.discount = 0;
  await cart.save();

  await sendEmail({
    to: req.user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: emailTemplates.orderConfirmation(req.user.name, order.orderNumber, order.total),
  });

  res.status(201).json({
    success: true,
    message: "Payment verified and order placed successfully",
    data: { order },
  });
});

// ─── @desc Create a COD order (no Razorpay involved) ────────────
// @route POST /api/orders/cod
export const createCODOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, notes } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  const orderItems = await buildOrderItemsFromCart(cart);
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = cart.discount || 0;
  const shippingCharge = subtotal - discount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  // COD orders above ₹50,000 are blocked (fraud prevention) — adjust as needed
  if (subtotal > 50000) {
    res.status(400);
    throw new Error("Cash on Delivery is not available for orders above ₹50,000. Please pay online.");
  }

  const codCharge = 49; // extra handling charge for COD
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + shippingCharge + codCharge + tax);

  const orderNumber = await Order.generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "confirmed",
    subtotal,
    discount,
    shippingCharge: shippingCharge + codCharge,
    tax,
    total,
    couponCode: cart.couponCode,
    notes,
    trackingEvents: [
      { status: "confirmed", message: "Order placed successfully. Pay on delivery." },
    ],
    estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // +6 days
  });

  await decrementStock(orderItems);

  cart.items = [];
  cart.couponCode = null;
  cart.discount = 0;
  await cart.save();

  await sendEmail({
    to: req.user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: emailTemplates.orderConfirmation(req.user.name, order.orderNumber, order.total),
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully. Pay cash on delivery.",
    data: { order },
  });
});

// ─── @desc Get logged-in user's orders ───────────────────────────
// @route GET /api/orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user._id };
  if (status) query.orderStatus = status;

  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: { data: orders, page: pageNum, pages: Math.ceil(total / limitNum), total },
  });
});

// ─── @desc Get single order by ID (owner or admin only) ─────────
// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product", "name images slug");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You are not authorized to view this order");
  }

  res.json({ success: true, data: { order } });
});

// ─── @desc Track order by order number (public-ish, needs login) ─
// @route GET /api/orders/track/:orderNumber
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You are not authorized to track this order");
  }

  res.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      trackingEvents: order.trackingEvents,
      estimatedDelivery: order.estimatedDelivery,
    },
  });
});

// ─── @desc Cancel an order (user, only if not yet shipped) ───────
// @route PUT /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to cancel this order");
  }

  if (["shipped", "out_for_delivery", "delivered", "cancelled"].includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Order cannot be cancelled once it is ${order.orderStatus}`);
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = reason || "Cancelled by customer";
  order.addTrackingEvent("cancelled", `Order cancelled: ${order.cancelReason}`);

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
    product.totalSold = Math.max(0, (product.totalSold || 0) - item.quantity);
    await product.save();
  }

  await order.save();

  res.json({ success: true, message: "Order cancelled successfully", data: { order } });
});