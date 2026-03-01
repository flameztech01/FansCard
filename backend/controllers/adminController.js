// controllers/adminController.js
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js"; // should set cookie "jwt"
import generateAdminToken from "../utils/generateAdminToken.js"; 
// ✅ If you don't have generateAdminToken.js, you can use generateToken(res, admin._id)
// but it's better to separate admin cookie name (e.g. "admin_jwt") to avoid conflicts.

/**
 * Helpers
 */
const safeAdmin = (admin) => ({
  _id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive,
  lastLogin: admin.lastLogin,
  createdAt: admin.createdAt,
});

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  cardId: user.cardId,
  packageType: user.packageType,
  amount: user.amount,
  paymentReference: user.paymentReference,
  receiptUrl: user.receiptUrl,
  paid: user.paid,
  paymentDate: user.paymentDate,
  status: user.status,
  approvedAt: user.approvedAt,
  approvedBy: user.approvedBy,
  rejectedAt: user.rejectedAt,
  rejectedBy: user.rejectedBy,
  rejectionReason: user.rejectionReason,
  adminNotes: user.adminNotes,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @desc    Admin signup (create admin)
 * @route   POST /api/admin/signup
 * @access  Private (Super Admin) OR Public if you want first-time bootstrap
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("name, email and password are required");
  }

  const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    res.status(400);
    throw new Error("Admin with this email already exists");
  }

  const admin = await Admin.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: role && ["admin", "super_admin"].includes(role) ? role : "admin",
    createdBy: req.user?._id || null, // if protect is used
  });

  // ✅ token (choose one)
  // generateToken(res, admin._id);
  if (typeof generateAdminToken === "function") {
    generateAdminToken(res, admin._id);
  } else {
    generateToken(res, admin._id);
  }

  res.status(201).json(safeAdmin(admin));
});

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("email and password are required");
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (!admin) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!admin.isActive) {
    res.status(403);
    throw new Error("Admin account is disabled");
  }

  const match = await admin.comparePassword(password);
  if (!match) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  admin.lastLogin = new Date();
  await admin.save();

  // ✅ token (choose one)
  // generateToken(res, admin._id);
  if (typeof generateAdminToken === "function") {
    generateAdminToken(res, admin._id);
  } else {
    generateToken(res, admin._id);
  }

  res.status(200).json(safeAdmin(admin));
});

/**
 * @desc    Get all users (for admin dashboard)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  // optional filters: status, search
  const { status, search } = req.query;

  const query = {};

  if (status && typeof status === "string") {
    query.status = status;
  }

  if (search && typeof search === "string") {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { cardId: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .select("-password -__v");

  res.status(200).json(users);
});

/**
 * @desc    Get user full info by id (admin)
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400);
    throw new Error("User id is required");
  }

  const user = await User.findById(req.params.id).select("-password -__v");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user); // ✅ full userInfo
});

/**
 * @desc    Admin updates user status (approve/reject/pending)
 *          If approved -> issue cardId
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatusAdmin = asyncHandler(async (req, res) => {
  const { status, rejectionReason, adminNotes } = req.body;

  const allowed = [
    "approved",
    "rejected",
    "pending_verification",
    "pending_payment",
  ];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.status = status;
  if (adminNotes !== undefined) user.adminNotes = adminNotes;

  if (status === "approved") {
    user.approvedAt = new Date();
    user.approvedBy = req.user?._id;

    // ✅ ALWAYS issue unique cardId if missing
    if (!user.cardId) {
      let cardId = "";
      let exists = true;

      while (exists) {
        cardId = `FC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        // eslint-disable-next-line no-await-in-loop
        exists = await User.exists({ cardId });
      }

      user.cardId = cardId;
    }

    user.paid = true;
    if (!user.paymentDate) user.paymentDate = new Date();

    user.rejectedAt = undefined;
    user.rejectedBy = undefined;
    user.rejectionReason = undefined;
  }

  if (status === "rejected") {
    user.rejectedAt = new Date();
    user.rejectedBy = req.user?._id;
    user.rejectionReason = rejectionReason || "Payment declined";

    user.approvedAt = undefined;
    user.approvedBy = undefined;
    // optional: user.cardId = undefined;
  }

  if (status === "pending_payment" || status === "pending_verification") {
    user.approvedAt = undefined;
    user.approvedBy = undefined;

    user.rejectedAt = undefined;
    user.rejectedBy = undefined;
    user.rejectionReason = undefined;

    // optional: if you want cardId removed when going back
    // user.cardId = undefined;
  }

  const updated = await user.save();

  res.status(200).json({
    message: "Status updated",
    user: safeUser(updated),
  });
});

export {
  signup,
  login,
  getUsers,
  getUserById,
  updateUserStatusAdmin,
};