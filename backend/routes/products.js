const express = require("express");
const router  = express.Router();
const { optionalAuth } = require("../middleware/auth");

const {
  getProducts,
  getProductBySlug,
  getFilterOptions,
  getRelatedProducts,
  getPCBuilderComponents,
} = require("../controllers/productController");

router.get("/",                              optionalAuth, getProducts);
router.get("/filters/:category",              getFilterOptions);
router.get("/pc-builder/:componentType",      getPCBuilderComponents);
router.get("/:slug/related",                  getRelatedProducts);
router.get("/:slug",                          optionalAuth, getProductBySlug);

export default router;