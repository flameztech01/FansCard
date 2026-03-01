import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // ✅ Who paid
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ What they’re paying for (fan card / subscription / etc.)
    purpose: {
      type: String,
      default: "fan_card",
      trim: true,
    },

    // ✅ Amount details
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN", uppercase: true, trim: true },

    // ✅ Receipt (manual proof)
    receiptImage: { type: String, required: true, trim: true },

    // ✅ Payment status for admin review
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // ✅ Optional notes (admin/user)
    note: { type: String, trim: true },

    // ✅ If you later support crypto payments too
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "crypto"],
      default: "bank_transfer",
      trim: true,
    },

    // ✅ Crypto fields (optional)
    txHash: { type: String, trim: true },
    walletAddress: { type: String, trim: true },

    // ✅ Admin action info (optional)
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;