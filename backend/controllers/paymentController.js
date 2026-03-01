// controllers/paymentController.js
import asyncHandler from "express-async-handler";
import Payment from "../models/paymentModel.js";


// ✅ 1) Create Payment + Upload Receipt (user)
const createPayment = asyncHandler(async (req, res) => {
  const { amount, currency, purpose, paymentMethod, txHash, note } = req.body;

  if (!amount) {
    res.status(400);
    throw new Error("Amount is required");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Receipt image is required");
  }

  const payment = await Payment.create({
    user: req.user._id,
    amount: Number(amount),
    currency: (currency || "USDT").toUpperCase(),
    purpose: purpose || "fan_card",
    paymentMethod: paymentMethod || "crypto",
    
    // 👇 Already uploaded by multer-storage-cloudinary
    receiptImage: req.file.path,
    receiptPublicId: req.file.filename,

    txHash: txHash || undefined,
    note: note || "",
    status: "pending",
  });

  res.status(201).json({
    message: "Payment submitted. Awaiting confirmation.",
    payment,
  });
});

// ✅ 2) Get My Payments (user)
 const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(payments);
});

// ✅ 3) Get Single Payment (user/admin)
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("user", "name email username");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  // basic protection: user can only view their own payment (unless you later add admin)
  if (payment.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view this payment");
  }

  res.status(200).json(payment);
});

// ✅ 4) Admin: Get All Payments (optional)
// (If you truly don't want roles now, you can still keep this for later and protect it with an admin middleware later.)
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate("user", "name email username")
    .sort({ createdAt: -1 });

  res.status(200).json(payments);
});

// ✅ 5) Admin: Approve / Reject Payment (optional)
const reviewPayment = asyncHandler(async (req, res) => {
  const { status, note } = req.body; // status = "approved" or "rejected"

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error('Status must be "approved" or "rejected"');
  }

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  payment.status = status;
  if (note) payment.note = note;

  payment.reviewedBy = req.user._id;
  payment.reviewedAt = new Date();

  const updated = await payment.save();
  res.status(200).json(updated);
});

export {
    createPayment,
    getMyPayments,
    getPaymentById,
    getAllPayments,
    reviewPayment,
}