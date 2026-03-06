import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userPaymentMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    label: {
      type: String,
      trim: true,
      default: "",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const selectedPaymentMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    label: {
      type: String,
      trim: true,
      default: "",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

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

    celebName: {
      type: String,
      trim: true,
      default: "",
    },

    celebLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CelebLink",
      default: null,
    },

    paymentMethods: {
      type: [userPaymentMethodSchema],
      default: [],
    },

    selectedPaymentMethod: {
      type: selectedPaymentMethodSchema,
      default: null,
    },

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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;