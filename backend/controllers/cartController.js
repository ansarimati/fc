const Cart         = require("../models/Cart");
const Product      = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

/** Helper: populate cart and compute totals */
export const buildCartResponse = async (cart) => {
  await cart.populate("items.product");

  const items = cart.items
    .filter((item) => item.product && item.product.isActive) // skip deleted products
    .map((item) => {
      let variant = null;
      if (item.variantId) {
        variant = item.product.variants.id(item.variantId);
      }
      const price = variant ? variant.price : item.price;
      return {
        product:  item.product,
        variant,
        quantity: item.quantity,
        price,
      };
    });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const discount = cart.discount || 0;
  const shipping = subtotal > 0 && subtotal < 5000 ? 99 : 0; // free shipping over ₹5000
  const total = Math.max(0, subtotal - discount + shipping);

  return {
    items,
    totalItems,
    subtotal,
    discount,
    shipping,
    total,
    couponCode: cart.couponCode,
  };
};

// ─── @desc Get current user's cart ────────────────────────────
// @route GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  const response = await buildCartResponse(cart);
  res.json({ success: true, data: { cart: response } });
});

// ─── @desc Add item to cart ────────────────────────────────────
// @route POST /api/cart/add
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  let price = product.effectivePrice;
  let availableStock = product.stock;

  if (variantId) {
    const variant = product.variants.id(variantId);
    if (!variant) {
      res.status(404);
      throw new Error("Product variant not found");
    }
    price = variant.price;
    availableStock = variant.stock;
  }

  if (availableStock < quantity) {
    res.status(400);
    throw new Error(`Only ${availableStock} unit(s) available in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      (item.variantId?.toString() || null) === (variantId || null)
  );

  if (existingItem) {
    const newQty = existingItem.quantity + Number(quantity);
    if (newQty > availableStock) {
      res.status(400);
      throw new Error(`Only ${availableStock} unit(s) available in stock`);
    }
    existingItem.quantity = newQty;
    existingItem.price = price;
  } else {
    cart.items.push({ product: productId, variantId: variantId || null, quantity, price });
  }

  await cart.save();
  const response = await buildCartResponse(cart);

  res.json({ success: true, message: "Item added to cart", data: { cart: response } });
});

// ─── @desc Update item quantity ────────────────────────────────
// @route PUT /api/cart/update
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (i) =>
      i.product.toString() === productId &&
      (i.variantId?.toString() || null) === (variantId || null)
  );

  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const product = await Product.findById(productId);
  const availableStock = variantId
    ? product.variants.id(variantId)?.stock
    : product.stock;

  if (quantity > availableStock) {
    res.status(400);
    throw new Error(`Only ${availableStock} unit(s) available in stock`);
  }

  item.quantity = quantity;
  await cart.save();

  const response = await buildCartResponse(cart);
  res.json({ success: true, message: "Cart updated", data: { cart: response } });
});

// ─── @desc Remove item from cart ────────────────────────────────
// @route DELETE /api/cart/remove
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (i) =>
      !(
        i.product.toString() === productId &&
        (i.variantId?.toString() || null) === (variantId || null)
      )
  );

  await cart.save();
  const response = await buildCartResponse(cart);
  res.json({ success: true, message: "Item removed from cart", data: { cart: response } });
});

// ─── @desc Clear entire cart ─────────────────────────────────────
// @route DELETE /api/cart/clear
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = null;
    cart.discount = 0;
    await cart.save();
  }
  res.json({ success: true, message: "Cart cleared" });
});

// ─── @desc Apply coupon code ─────────────────────────────────────
// @route POST /api/cart/coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Simple hardcoded coupon logic — extend with a Coupon model later if needed
  const coupons = {
    WELCOME10: 0.10,
    TECH500:   500, // flat ₹500 off
  };

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const upperCode = code?.toUpperCase();

  if (!upperCode || !(upperCode in coupons)) {
    res.status(400);
    throw new Error("Invalid coupon code");
  }

  const discountValue = coupons[upperCode];
  const discount =
    discountValue < 1 ? Math.round(subtotal * discountValue) : discountValue;

  cart.couponCode = upperCode;
  cart.discount = Math.min(discount, subtotal);
  await cart.save();

  const response = await buildCartResponse(cart);
  res.json({ success: true, message: "Coupon applied successfully", data: { cart: response } });
});
