// routes/cardRoutes.js
import express from "express";
import {
  createCard,
  updateCardDetails,
  uploadReceipt,
  getMyCards,
  getCardById,
  adminListCards,
  adminConfirmPayment,
  adminDeclinePayment,
} from "../controllers/cardController.js";
import { protect, adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCard);
router.get("/my", protect, getMyCards);
router.get("/:id", protect, getCardById);

router.put("/:id/details", protect, updateCardDetails);
router.put("/:id/receipt", protect, uploadReceipt);

// admin
router.get("/admin/list", protect, adminProtect, adminListCards);
router.put("/admin/:id/confirm", protect, adminProtect, adminConfirmPayment);
router.put("/admin/:id/decline", protect, adminProtect, adminDeclinePayment);

export default router;