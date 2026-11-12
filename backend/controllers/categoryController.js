const Category = require("../models/Category");
const asyncHandler = require("../middleware/asyncHandler");
const { slugify } = require("../utils/helpers");

// ─── @desc Get all active categories ─────────────────────────
// @route GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, data: { categories } });
});

// ─── @desc Get single category by slug ───────────────────────
// @route GET /api/categories/:slug
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, data: { category } });
});

// ═══ ADMIN ═══

// ─── @desc Create category ────────────────────────────────────
// @route POST /api/admin/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, icon, parent, sortOrder } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const slug = slugify(name);
  const exists = await Category.findOne({ slug });
  if (exists) {
    res.status(409);
    throw new Error("A category with this name already exists");
  }const category = await Category.create({
    name, slug, description, image, icon, parent: parent || null, sortOrder: sortOrder || 0,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category },
  });
});

// ─── @desc Update category ─────────────────────────────────────
// @route PUT /api/admin/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  if (req.body.name && req.body.name !== category.name) {
    req.body.slug = slugify(req.body.name);
  }

  Object.assign(category, req.body);
  await category.save();

  res.json({ success: true, message: "Category updated successfully", data: { category } });
});

// ─── @desc Delete category ──────────────────────────────────────
// @route DELETE /api/admin/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  category.isActive = false;
  await category.save();
  res.json({ success: true, message: "Category deleted successfully" });
});

// ─── @desc Get all categories for admin (including inactive) ──
// @route GET /api/admin/categories
export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ sortOrder: 1 });
  res.json({ success: true, data: { categories } });
});