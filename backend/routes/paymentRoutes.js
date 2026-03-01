// routes/paymentRoutes.js
import express from "express";



import {
  createPayment,
  getMyPayments,
  getPaymentById,
  getAllPayments,
  reviewPayment,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



// User
router.post("/create", protect, createPayment);
router.get("/mine", protect, getMyPayments);
router.get("/:id", protect, getPaymentById);

// Admin
router.get("/", protect, getAllPayments);
router.put("/:id/review", protect, reviewPayment);

export default router;