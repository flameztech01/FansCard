import express from "express";
import {
  googleAuth,
  logoutUser,
  getUserInfo,
  updatePackage,
  uploadReceipt
} from "../controllers/userController.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import { protect, adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer -> Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "FanCardReceipt_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"], // add webp if you want
    // public_id: (req, file) => `receipt_${req.user._id}_${Date.now()}`,
  },
});

const upload = multer({ storage });

// Optional: test connection (DON'T block server startup if it fails)
cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully"))
  .catch((err) => console.error("❌ Cloudinary not connected:", err.message));

// 🔐 Google Login / Register
router.post("/google", upload.single("image"), googleAuth);

// 🚪 Logout
router.post("/logout", logoutUser);

// 👤 Get logged-in user info (auto-fill fan card)
router.get("/me", protect, getUserInfo);

// 💳 User selects package + amount
router.put("/package", protect, updatePackage);

// ✅ receipt upload (sets status -> pending_verification)
router.put("/receipt", upload.single("receipt"), protect, uploadReceipt);


export default router;