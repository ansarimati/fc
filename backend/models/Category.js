const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true
  },
  description: {
    type: String, trim: true, default: ""
  },
  image: { type: String, default: "" },
  icon: { type: String, default: "" },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  isActive: {
    type: Boolean, default: true
  },
  sortOrder: {
    type: Number, default: 0
  }
}, {
  timestamps: true
});

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;