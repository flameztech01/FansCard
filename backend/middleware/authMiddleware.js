import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";

// USER PROTECT (uses cookie: jwt)
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no user token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, user token failed");
  }
});

// ADMIN PROTECT (uses cookie: admin_jwt)
export const adminProtect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.admin_jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized as admin, no admin token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin) {
      res.status(401);
      throw new Error("Admin not found");
    }

    if (!admin.isActive) {
      res.status(401);
      throw new Error("Admin account disabled");
    }

    // attach admin
    req.admin = admin;

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized as admin, token failed/expired");
  }
});

// OPTIONAL: only super_admin
export const superAdminProtect = asyncHandler(async (req, res, next) => {
  if (!req.admin) {
    res.status(401);
    throw new Error("Not authorized as admin");
  }

  if (req.admin.role !== "super_admin") {
    res.status(403);
    throw new Error("Super admin access required");
  }

  next();
});