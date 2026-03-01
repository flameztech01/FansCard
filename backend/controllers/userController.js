import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";

import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getUserInfoFromAccessToken = async (accessToken) => {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch user info from Google");
  return response.json();
};

/**
 * @desc    Google Auth (create/login user)
 * @route   POST /api/users/google
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { token: googleToken, phone } = req.body;

  if (!googleToken) {
    res.status(400);
    throw new Error("Google token is required");
  }

  let email, name;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    email = payload?.email;
    name = payload?.name;
  } catch (err) {
    const userInfo = await getUserInfoFromAccessToken(googleToken);
    email = userInfo?.email;
    name = userInfo?.name;
  }

  if (!email) {
    res.status(400);
    throw new Error("Google account email not found");
  }

  let user = await User.findOne({ email });

  // create user if not exists (password required in your model)
  if (!user) {
    const randomPassword = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

    user = await User.create({
      name: name || "User",
      email,
      phone: phone || "0000000000",
      password: randomPassword,
      status: "pending_payment",
      paid: false,
    });
  }

  generateToken(res, user._id);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cardId: user.cardId,
    packageType: user.packageType,
    amount: user.amount,
    paid: user.paid,
    status: user.status,
  });
});

/**
 * @desc    Get logged-in user info (to auto-fill form/card)
 * @route   GET /api/users/me
 * @access  Private
 */
const getUserInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__v");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

/**
 * @desc    Set/Update package + amount (before payment)
 * @route   PUT /api/users/package
 * @access  Private
 */
const updatePackage = asyncHandler(async (req, res) => {
  const { packageType, amount } = req.body;

  if (!packageType || amount === undefined) {
    res.status(400);
    throw new Error("packageType and amount are required");
  }

  const allowed = ["basic", "standard", "premium"];
  if (!allowed.includes(packageType)) {
    res.status(400);
    throw new Error("Invalid packageType");
  }

  if (Number(amount) <= 0) {
    res.status(400);
    throw new Error("Invalid amount");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Don’t allow changing package after approval
  if (user.status === "approved") {
    res.status(400);
    throw new Error("Card already approved. Package cannot be changed.");
  }

  user.packageType = packageType;
  user.amount = Number(amount);

  // reset payment progress if they change package
  user.paid = false;
  user.paymentDate = undefined;
  user.paymentReference = undefined;
  user.receiptUrl = undefined;

  user.status = "pending_payment";

  const updated = await user.save();

  res.status(200).json({
    message: "Package updated",
    packageType: updated.packageType,
    amount: updated.amount,
    status: updated.status,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const uploadReceipt = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // must have selected package before receipt
  if (!user.packageType || !user.amount) {
    res.status(400);
    throw new Error("Select a package before uploading receipt");
  }

  // stop if already approved
  if (user.status === "approved") {
    res.status(400);
    throw new Error("Card already approved");
  }

  // ✅ multer-storage-cloudinary puts the url here:
  const receiptUrl = req.file?.path;

  if (!receiptUrl) {
    res.status(400);
    throw new Error("No receipt file uploaded");
  }

  const paymentReference = req.body?.paymentReference;

  user.receiptUrl = receiptUrl;
  if (paymentReference) user.paymentReference = paymentReference;

  // ✅ move status to pending_verification
  user.status = "pending_verification";
  user.paid = false;
  user.paymentDate = new Date();

  const updated = await user.save();

  res.status(200).json({
    message: "Receipt uploaded. Pending verification.",
    receiptUrl: updated.receiptUrl,
    status: updated.status,
  });
});


export {
  googleAuth,
  getUserInfo,
  updatePackage,
  logoutUser,
  uploadReceipt
};