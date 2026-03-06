// controllers/adminController.js
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import CelebLink from "../models/celebLinkModel.js"
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

  // ✅ Set admin_jwt cookie + return token
  const token = generateAdminToken(res, admin._id);

  res.status(200).json({
    ...safeAdmin(admin),
    token, // optional but good to include
  });
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

const generateCelebLink = asyncHandler(async (req, res) => {
  const { celebName, expiresInDays, paymentMethods } = req.body;

  if (!celebName || typeof celebName !== "string") {
    res.status(400);
    throw new Error("celebName is required");
  }

  const cleanName = celebName.trim();
  if (cleanName.length < 2) {
    res.status(400);
    throw new Error("celebName is too short");
  }

  if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
    res.status(400);
    throw new Error("At least one payment method is required");
  }

  const cleanedPaymentMethods = paymentMethods.map((method, index) => {
    if (!method || typeof method !== "object") {
      res.status(400);
      throw new Error(`paymentMethods[${index}] must be an object`);
    }

    const methodId = String(method.methodId || "").trim();
    const type = String(method.type || "").trim().toLowerCase();
    const label = String(method.label || "").trim();

    if (!methodId) {
      res.status(400);
      throw new Error(`paymentMethods[${index}].methodId is required`);
    }

    if (!type) {
      res.status(400);
      throw new Error(`paymentMethods[${index}].type is required`);
    }

    if (!label) {
      res.status(400);
      throw new Error(`paymentMethods[${index}].label is required`);
    }

    return {
      methodId,
      type,
      label,
      details:
        method.details && typeof method.details === "object"
          ? method.details
          : {},
    };
  });

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const rawToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  let expiresAt = null;
  if (expiresInDays && Number(expiresInDays) > 0) {
    expiresAt = new Date(
      Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000
    );
  }

  const doc = await CelebLink.create({
    celebName: cleanName,
    slug,
    tokenHash,
    paymentMethods: cleanedPaymentMethods,
    createdBy: req.user?._id || null,
    expiresAt,
    isActive: true,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3030";
  const signupLink = `${frontendUrl}/fan/${slug}/${rawToken}`;

  res.status(201).json({
    message: "Celeb signup link created",
    celebName: doc.celebName,
    signupLink,
    expiresAt: doc.expiresAt,
  });
});

// ✅ Get all generated celeb links (for admin dashboard)
// @route   GET /api/admin/celeb-links
// @access  Private/Admin
const getGeneratedLinks = asyncHandler(async (req, res) => {
  const { search, active } = req.query;

  const query = {};

  // optional: filter active true/false
  if (active !== undefined) {
    // active can come as "true"/"false"
    if (active === "true") query.isActive = true;
    if (active === "false") query.isActive = false;
  }

  // optional: search by celebName
  if (search && typeof search === "string") {
    query.celebName = { $regex: search, $options: "i" };
  }

  const links = await CelebLink.find(query)
    .sort({ createdAt: -1 })
    .select("-__v"); // keep tokenHash hidden if you want, see below

  // ✅ If you want to HIDE tokenHash from frontend, use this instead:
  // const links = await CelebLink.find(query).sort({ createdAt: -1 }).select("-tokenHash -__v");

  res.status(200).json(links);
});


export {
  signup,
  login,
  getUsers,
  getUserById,
  updateUserStatusAdmin,
  generateCelebLink,
  getGeneratedLinks
};