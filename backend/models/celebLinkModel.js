// models/celebLinkModel.js
import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false },
);

const celebLinkSchema = new mongoose.Schema(
  {
    celebName: {
      type: String,
      required: true,
      trim: true,
    },

    celebPicture: {
      type: String,
      trim: true,
      default: "",
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    paymentMethods: {
      type: [paymentMethodSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

celebLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CelebLink = mongoose.model("CelebLink", celebLinkSchema);
export default CelebLink;
