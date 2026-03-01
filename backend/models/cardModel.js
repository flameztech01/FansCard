// models/cardModel.js
import mongoose from "mongoose";

const cardDetailsSchema = new mongoose.Schema(
  {
    displayName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },

    favoriteMovie: { type: String, trim: true },
    favoriteCharacter: { type: String, trim: true },
    fanSinceYear: { type: Number, min: 1900, max: 3000 },
    tagline: { type: String, trim: true, maxlength: 80 },

    fanPhotoUrl: { type: String, trim: true, required: true },
    signatureUrl: { type: String, trim: true },

    qrData: { type: String, trim: true },
    qrCodeUrl: { type: String, trim: true },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["crypto", "bank_transfer", "paystack"],
      default: "crypto",
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },

    receiptUrl: { type: String, trim: true },
    txRef: { type: String, trim: true },

    status: {
      type: String,
      enum: ["draft", "pending", "confirmed", "declined"],
      default: "draft",
      index: true,
    },

    paidAt: { type: Date },
    confirmedAt: { type: Date },
    declinedAt: { type: Date },

    adminNote: { type: String, trim: true },
  },
  { _id: false }
);

const cardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cardId: {
      type: String,
      unique: true,
      trim: true,
      default: () =>
        `JD-FAN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      index: true,
    },

    // 🔥 Hardcoded Actor
    actorName: {
      type: String,
      default: "John Doe",
      immutable: true,
    },

    packageType: {
      type: String,
      enum: ["basic", "standard", "premium", "vip"],
      required: true,
      index: true,
    },

    designCode: { type: String, trim: true },
    theme: { type: String, trim: true },

    cardDetails: { type: cardDetailsSchema, required: true },

    payment: { type: paymentSchema, required: true },

    cardStatus: {
      type: String,
      enum: ["draft", "submitted", "processing", "ready", "delivered"],
      default: "draft",
      index: true,
    },

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

cardSchema.index({ "payment.status": 1, createdAt: -1 });

const Card = mongoose.model("Card", cardSchema);

export default Card;