// routes/adminRoutes.js
import express from "express";
import {
  signup,
  login,
  getUsers,
  getUserById,
  updateUserStatusAdmin,
} from "../controllers/adminController.js";

import { adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * AUTH
 * If you want only super_admin to create admins, use superAdminProtect.
 * If you want open signup for first admin, switch to public (no middleware).
 */

// Create admin
// router.post("/signup", protect, superAdminProtect, signup);
// If you want public signup instead, use this:
router.post("/signup", signup);

// Login admin
router.post("/login", login);

/**
 * USERS (Admin Dashboard)
 */
router.get("/users", adminProtect, getUsers);
router.get("/users/:id", adminProtect, getUserById);
router.put("/users/:id/status", adminProtect, updateUserStatusAdmin);

export default router;