import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

     celebName: { type: String, trim: true, default: "" },

    // Each user gets one FanCard
    cardId: {
      type: String,
      unique: true,
      sparse: true,
    },

    packageType: {
      type: String,
      enum: ["basic", "standard", "premium"],
    },

    amount: Number,

    // Payment
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },

    receiptUrl: String,

    paid: {
      type: Boolean,
      default: false,
    },

    paymentDate: Date,

    // Admin Status
    status: {
      type: String,
      enum: [
        "pending_payment",
        "pending_verification",
        "approved",
        "rejected",
      ],
      default: "pending_payment",
    },

    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    rejectionReason: String,
    adminNotes: String,
  },
  {
    timestamps: true,
  }
);


// 🔐 Hash password before saving (NO next)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// 🔑 Compare password for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;