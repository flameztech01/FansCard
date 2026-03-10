// routes/adminRoutes.js
import express from "express";
import {
  signup,
  login,
  getUsers,
  getUserById,
  updateUserStatusAdmin,
  generateCelebLink,
  getGeneratedLinks
} from "../controllers/adminController.js";

import { adminProtect } from "../middleware/authMiddleware.js";

import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

//Cloudinary Configuration with lowercase unserscores
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CelebrityPicture",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({storage});

cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connected successfully'))
  .catch(result => console.error('Cloudinary not fonneted', err.message));


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

// ✅ NEW
router.post("/celeb-links", adminProtect, upload.single('image'), generateCelebLink);
router.get("/celeb-links", adminProtect, getGeneratedLinks);

export default router;