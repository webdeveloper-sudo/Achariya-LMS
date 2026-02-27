const mongoose = require("mongoose");

const marketplaceItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      enum: ["theme", "avatar", "music", "certificate", "other"],
      required: true,
    },
    iconName: {
      type: String, // Lucide icon name
      default: "ShoppingBag",
    },
    color: {
      type: String,
      default: "blue",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MarketplaceItem", marketplaceItemSchema);
