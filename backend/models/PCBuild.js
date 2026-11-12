const mongoose = require("mongoose");

const pcBuildSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, default: "My Custom Build" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    components: {
      cpu:         { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      motherboard: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      ram:         { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      gpu:         { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      storage:     { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      psu:         { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      cabinet:     { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      cooler:      { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      monitor:     { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      keyboard:    { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
      mouse:       { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    },
    totalPrice: { type: Number, default: 0 },
    isPublic:   { type: Boolean, default: false }, // share build with others
    isPurchased:{ type: Boolean, default: false },
    orderRef:   { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

pcBuildSchema.index({ user: 1 });

const PCBuild = mongoose.model("PCBuild", pcBuildSchema);

export default PCBuild;