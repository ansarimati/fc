const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const { slugify } = require("../utils/helpers");

// ─── @desc Get all products with filters, search, sort, pagination ─
// @route GET /api/products
// @access Public

export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    tags,
    sortBy = "newest",
    page = 1,
    limit = 12,
    search,
    pcBuilderCategory,
    isFeatured,
    isNewArrival,
    isBestSeller,
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (pcBuilderCategory) query.pcBuilderCategory = pcBuilderCategory;

  if (brand) {
    const brands = Array.isArray(brand) ? brand : brand.split(",");
    query.brand = { $in: brands }
  };

  if (tags) {
    const tagList = Array.isArray(tags) ? tags : tags.split(",");
    query.tags = { $in: tagList };
  }

  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }

  if (rating) query.rating = { $gte: Number(rating) };
  if (inStock === "true") query.stock = { $gt: 0 };

  if (isFeatured == "true") query.isFeatured = true;
  if (isNewArrival === "true") query.isNewArrival = true;
  if (isBestSeller === "true") query.isBestSeller = true;

  if (search) {
    query.$text = { $search: search };
  }

  // Sort mapping
  const sortMap = {
    price_acs: { basePrice: 1 },
    price_dec: { basePrice: -1 },
    rating: { rating: -1 },
    newest: { newest: -1 },
    popular: { totalSold: -1 }
  }
  const sort = sortMap[sortBy] || sortMap[newest];

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      data:    products,
      page:    pageNum,
      pages:   Math.ceil(total / limitNum),
      total,
      hasMore: pageNum * limitNum < total,
    },
  });
})

// ─── @desc Get single product by slug ─────────────────────────
// @route GET /api/products/:slug
// @access Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.views += 1;
  await product.save();

  res.json({ success: true, data: { product } });
});

// ─── @desc Get available brands + price range for a category (for filter sidebar) ─
// @route GET /api/products/filters/:category
// @access Public
export const getFilterOptions = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const query = category === "all" ? { isActive: true } : { category, isActive: true };

  const [brands, priceStats] = await Promise.all([
    Product.distinct("brand", query),
    Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$basePrice" },
          maxPrice: { $max: "$basePrice" }
        },
      },
    ])
  ]);

  res.json({
    success: true,
    data: {
      brands: brands.sort(),
      priceRange: priceStats[0]
        ? { min: priceStats[0].minPrice, max: priceStats[0].maxPrice }
        : { min: 0, max: 0 },
    },
  });
});

// ─── @desc Get related products (same category, exclude current) ─
// @route GET /api/products/:slug/related
// @access Public
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true
  })
    .limit(8)
    .sort({ rating: -1 })

    res.json({ success: true, data: { products: related } });
});

// ─── @desc Get products for PC Builder by component category ────
// @route GET /api/products/pc-builder/:componentType
// @access Public
export const getPCBuilderComponents = asyncHandler(async (req, res) => {
  const { componentType } = req.params;
  const { minPrice, maxPrice, brand, sortBy = "price_asc" } = req.query;

  const query = {
    pcBuilderCompatible: true,
    pcBuilderCategory: componentType,
    isActive: true
  };

  if (brand) query.brand = { $in: brand.split(",") };
  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = Number(minPrice);
    if (maxPrice) query.basePrice.$lte = Number(maxPrice);
  }

  const sortMap = {
    price_asc: { basePrice: 1 }, price_desc: { basePrice: -1 }, rating: { rating: -1 }
  }

  const products = await Product.find(query).sort(sortMap[sortBy] || sortMap.price_asc);

  res.json({ success: true, data: { products } });
});

// ══════════════════════════════════════════════════════════════
//                      ADMIN CONTROLLERS
// ══════════════════════════════════════════════════════════════

// ─── @desc Create new product ────────────────────────────────
// @route POST /api/admin/products
// @access Admin

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, shortDesc, category, subCategory, brand,
    images, basePrice, salePrice, stock, sku, variants, specs, tags,
    isFeatured, isNewArrival, isBestSeller,
    pcBuilderCompatible, pcBuilderCategory, compatibilityTags,
  } = req.body;

  if (!name || !description || !category || !brand || !basePrice || !sku) {
    res.status(400);
    throw new Error("Please fill all required product fields");
  }

  if (!images || images.length === 0) {
    res.status(400);
    throw new Error("At least one product image is required");
  }

  let slug = slugify(name);
  const slugExists = await Product.findOne({ slug });
  if (slugExists) slug = `${slug}-${Date.now().toString().slice(-5)}`;

  const product = await Product.create({
    name, slug, description, shortDesc, category, subCategory, brand,
    images, basePrice, salePrice, stock: stock || 0,
    sku: sku.toUpperCase(),
    variants: variants || [],
    specs: specs || [],
    tags: tags || [],
    isFeatured: !!isFeatured,
    isNewArrival: !!isNewArrival,
    isBestSeller: !!isBestSeller,
    pcBuilderCompatible: !!pcBuilderCompatible,
    pcBuilderCategory: pcBuilderCategory || null,
    compatibilityTags: compatibilityTags || [],
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product },
  });
})

// ─── @desc Update product ────────────────────────────────────
// @route PUT /api/admin/products/:id
// @access Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Re-slugify if name changed
  if (req.body.name && req.body.name !== product.name) {
    let newSlug = slugify(req.body.name);
    const slugExists = await Product.findOne({ slug: newSlug, _id: { $ne: product._id } });
    if (slugExists) newSlug = `${newSlug}-${Date.now().toString().slice(-5)}`;
    req.body.slug = newSlug;
  }

  Object.assign(product, req.body);
  await product.save();

  res.json({
    success: true,
    message: "Product updated successfully",
    data: { product },
  });
});

// ─── @desc Delete (soft-delete) product ──────────────────────
// @route DELETE /api/admin/products/:id
// @access Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product deleted successfully" });
});

// ─── @desc Get all products for admin (includes inactive) ────
// @route GET /api/admin/products
// @access Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category, status } = req.query;

  const query = {};
  if (category) query.category = category;
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;
  if (search) query.$text = { $search: search };

  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip     = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      data: products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    },
  });
});

// ─── @desc Get single product (admin — any status) ────────────
// @route GET /api/admin/products/:id
// @access Admin
export const getAdminProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, data: { product } });
});