const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
} = require("../controllers/cartController");

router.use(protect); // all cart routes require login

router.get("/",           getCart);
router.post("/add",       addToCart);
router.put("/update",     updateCartItem);
router.delete("/remove",  removeFromCart);
router.delete("/clear",   clearCart);
router.post("/coupon",    applyCoupon);

export default router;