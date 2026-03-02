// models/celebLinkModel.js
import mongoose from "mongoose";

const celebLinkSchema = new mongoose.Schema(
  {
    celebName: { type: String, required: true, trim: true },

    // store a HASH of token for security
    tokenHash: { type: String, required: true, unique: true, index: true },

    // optional: to disable links later
    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },

    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// optional: TTL auto-delete if expiresAt is set
celebLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CelebLink = mongoose.model("CelebLink", celebLinkSchema);
export default CelebLink;