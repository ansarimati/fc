const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    name:      { type: String, required: true }, // snapshot
    image:     { type: String, required: true }, // snapshot
    variantName: { type: String, default: "" },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    line1:    { type: String, required: true },
    line2:    { type: String, default: "" },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true },
  },
  { _id: false }
);

const trackingEventSchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    message:   { type: String, required: true },
    location:  { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: { type: shippingAddressSchema, required: true },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    subtotal:       { type: Number, required: true, min: 0 },
    discount:       { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    tax:            { type: Number, default: 0 },
    total:          { type: Number, required: true, min: 0 },

    couponCode: { type: String, default: null },
    notes:      { type: String, default: "" },

    trackingNumber:  { type: String, default: "" },
    trackingEvents:  [trackingEventSchema],
    estimatedDelivery: { type: Date },
    deliveredAt:     { type: Date },
    cancelledAt:     { type: Date },
    cancelReason:    { type: String, default: "" },
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

// ─── Static: generate unique order number ───────────────────
orderSchema.statics.generateOrderNumber = async function () {
  const date = new Date();
  const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `TB${yymmdd}${random}`;

  const exists = await this.findOne({ orderNumber });
  if (exists) return this.generateOrderNumber(); // retry on collision
  return orderNumber;
};

// ─── Instance method: add tracking event ────────────────────
orderSchema.methods.addTrackingEvent = function (status, message, location = "") {
  this.trackingEvents.push({ status, message, location, timestamp: new Date() });
};

const Order = mongoose.model("Order", orderSchema);
export default Order;