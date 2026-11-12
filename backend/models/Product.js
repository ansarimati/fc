const mongoose = require("mongoose");

const specSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
}, {
  _id: false
});

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sku: { type: String, required: true, unique: true, sparse: true }
});

const productSchema = new mongoose.Schema({
  name: {
      type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxLength: [200, "Product name can not exceed 200"] 
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  shortDesc: {
    type: String,
    maxLength: [300, "Short description can not exceed 300 characters"],
    default: ""
  },
  category: {
    type: String,
    required: true,
    enum: [
      "desktop",
      "laptop",
      "components",
      "peripherals",
      "networking",
      "storage",
      "monitors",
      "accessories",
    ],
  },
  subCategory: {
    type: String,
    trim: true,
    default: ""
  },
  brand: {
    type: String,
    required: [true, "Brand is required"],
    trim: true
  },
  images: {
    type: [String],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one product image is required"
    },
  },
  basePrice: {
    type: Number,
    required: [true, "Base price is required"],
    min: [0, "Base price can not be negative"]
  },
  salePrice: {
    type: Number,
    min: [0, "Sale price can not be negative"],
    validate: {
      validator: function (value) {
        return !value || value < this.basePrice;
      },
      message: "Sale price must be less than base price"
    }
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  variants: [variantSchema],
    specs: [specSchema],
    tags: [{ type: String, trim: true, lowercase: true }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: { type: Number, default: 0 },
    isFeatured:   { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },

    // ─── PC Builder Support ──────────────────────────────────
    pcBuilderCompatible: { type: Boolean, default: false },
    pcBuilderCategory: {
      type: String,
      enum: [
        "cpu", "motherboard", "ram", "gpu", "storage",
        "psu", "cabinet", "cooler", "monitor", "keyboard", "mouse",
        null,
      ],
      default: null,
    },
    // For compatibility checks in PC Builder (e.g. socket type, RAM type)
    compatibilityTags: [{ type: String, trim: true }],

    // Sales tracking (for admin analytics / best sellers)
    totalSold: { type: Number, default: 0 },
    views:     { type: Number, default: 0 },
}, 
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ pcBuilderCategory: 1 });
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  tags: "text"
});

//  ─── Virtual: effective price (sale price if available)
productSchema.virtual("effectivePrice").get(function () {
  return this.salePrice && this.salePrice < this.basePrice ? this.salePrice : this.basePrice;
});

// ─── Virtual: discount percentage ───────────────────────────
productSchema.virtual("discountPercentage").get(function () {
  if (!this.salePrice || this.salePrice >= this.basePrice ) return 0;
  return Math.round(((this.basePrice - this.salePrice) / this.basePrice) * 100)
});

// Virtual: in stock check
productSchema.virtual("instock").get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.some((v) => v.stock > 0);
  }
  return this.stock > 0;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;