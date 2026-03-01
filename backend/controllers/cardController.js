// controllers/cardController.js
import asyncHandler from "express-async-handler";
import Card from "../models/cardModel.js";

/**
 * Helper: ensure only owner or admin can access a card
 */
const assertOwnerOrAdmin = (card, req, res) => {
  const isOwner = String(card.user) === String(req.user?._id);
  const isAdmin = Boolean(req.user?.isAdmin);

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to access this card");
  }
};

/*
 * @desc    Create a new card request (when user clicks Buy Now)
 * @route   POST /api/cards
 * @access  Private
 *
 * Body: { packageType, designCode?, theme?, amount, currency?, method? }
 * Creates a "draft" card with minimal placeholders; user will fill details next.
 */
const createCard = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const {
    packageType,
    designCode,
    theme,
    amount,
    currency = "NGN",
    method = "crypto",
  } = req.body;

  if (!packageType) {
    res.status(400);
    throw new Error("packageType is required");
  }
  if (amount === undefined || amount === null || Number(amount) <= 0) {
    res.status(400);
    throw new Error("amount must be greater than 0");
  }

  // Create draft card; details will be updated via updateCardDetails
  const card = await Card.create({
    user: userId,
    packageType,
    designCode: designCode || "",
    theme: theme || "",
    cardDetails: {
      // placeholders; update endpoint will enforce required fields
      displayName: "Pending",
      fanPhotoUrl: "pending",
    },
    payment: {
      method,
      amount: Number(amount),
      currency,
      status: "draft",
    },
    cardStatus: "draft",
  });

  res.status(201).json(card);
});

/*
 * @desc    Update card details (form submission)
 * @route   PUT /api/cards/:id/details
 * @access  Private
 */
const updateCardDetails = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);

  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  assertOwnerOrAdmin(card, req, res);

  const {
    displayName,
    phone,
    country,
    city,
    favoriteMovie,
    favoriteCharacter,
    fanSinceYear,
    tagline,
    fanPhotoUrl,
    signatureUrl,
  } = req.body;

  // Ensure cardDetails exists
  if (!card.cardDetails) card.cardDetails = {};

  // Required fields
  if (!displayName || !fanPhotoUrl) {
    res.status(400);
    throw new Error("displayName and fanPhotoUrl are required");
  }

  card.cardDetails.displayName = displayName;
  card.cardDetails.fanPhotoUrl = fanPhotoUrl;

  // Optional fields
  if (phone !== undefined) card.cardDetails.phone = phone;
  if (country !== undefined) card.cardDetails.country = country;
  if (city !== undefined) card.cardDetails.city = city;

  if (favoriteMovie !== undefined) card.cardDetails.favoriteMovie = favoriteMovie;
  if (favoriteCharacter !== undefined)
    card.cardDetails.favoriteCharacter = favoriteCharacter;

  if (fanSinceYear !== undefined) card.cardDetails.fanSinceYear = fanSinceYear;
  if (tagline !== undefined) card.cardDetails.tagline = tagline;

  if (signatureUrl !== undefined) card.cardDetails.signatureUrl = signatureUrl;

  // Move lifecycle forward
  if (card.cardStatus === "draft") {
    card.cardStatus = "submitted";
  }

  const updated = await card.save();
  res.status(200).json(updated);
});

/*
 * @desc    Upload receipt / mark as paid (user clicks "I've paid")
 * @route   PUT /api/cards/:id/receipt
 * @access  Private
 *
 * Body: { receiptUrl, txRef?, walletAddressUsed? }
 * Sets payment.status = pending
 */
const uploadReceipt = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);

  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  assertOwnerOrAdmin(card, req, res);

  const { receiptUrl, txRef, walletAddressUsed } = req.body;

  if (!receiptUrl) {
    res.status(400);
    throw new Error("receiptUrl is required");
  }

  // Must have details before paying (optional rule, but recommended)
  if (!card.cardDetails?.displayName || !card.cardDetails?.fanPhotoUrl) {
    res.status(400);
    throw new Error("Complete card details before uploading receipt");
  }

  // Don’t allow re-upload after confirmed (unless you want)
  if (card.payment?.status === "confirmed") {
    res.status(400);
    throw new Error("Payment already confirmed for this card");
  }

  card.payment.receiptUrl = receiptUrl;
  if (txRef !== undefined) card.payment.txRef = txRef;
  if (walletAddressUsed !== undefined)
    card.payment.walletAddressUsed = walletAddressUsed;

  card.payment.status = "pending";
  card.payment.paidAt = new Date();

  // Optionally set card status to processing
  card.cardStatus = "processing";

  const updated = await card.save();
  res.status(200).json(updated);
});

/*
 * @desc    Get my cards (order history for logged in user)
 * @route   GET /api/cards/my
 * @access  Private
 */
 const getMyCards = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const cards = await Card.find({ user: userId, isArchived: false }).sort({
    createdAt: -1,
  });

  res.status(200).json(cards);
});

/*
 * @desc    Get single card by id (owner or admin)
 * @route   GET /api/cards/:id
 * @access  Private
 */
const getCardById = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id).populate(
    "user",
    "name email username profileImage"
  );

  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  assertOwnerOrAdmin(card, req, res);

  res.status(200).json(card);
});

/*
 * @desc    Admin: list cards (filter by payment status)
 * @route   GET /api/cards/admin?status=pending
 * @access  Private/Admin
 */
const adminListCards = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    throw new Error("Admin only");
  }

  const { status } = req.query;

  const query = { isArchived: false };
  if (status) query["payment.status"] = status;

  const cards = await Card.find(query)
    .populate("user", "name email username profileImage")
    .sort({ createdAt: -1 });

  res.status(200).json(cards);
});

/*
 * @desc    Admin: confirm payment
 * @route   PUT /api/cards/admin/:id/confirm
 * @access  Private/Admin
 */
const adminConfirmPayment = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    throw new Error("Admin only");
  }

  const card = await Card.findById(req.params.id);

  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  if (card.payment.status !== "pending") {
    res.status(400);
    throw new Error("Only pending payments can be confirmed");
  }

  card.payment.status = "confirmed";
  card.payment.confirmedAt = new Date();
  card.payment.adminNote = req.body?.adminNote || "";

  // move card forward
  card.cardStatus = "ready";

  const updated = await card.save();
  res.status(200).json(updated);
});

/*
 * @desc    Admin: decline payment
 * @route   PUT /api/cards/admin/:id/decline
 * @access  Private/Admin
 */
const adminDeclinePayment = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    throw new Error("Admin only");
  }

  const card = await Card.findById(req.params.id);

  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  if (card.payment.status !== "pending") {
    res.status(400);
    throw new Error("Only pending payments can be declined");
  }

  card.payment.status = "declined";
  card.payment.declinedAt = new Date();
  card.payment.adminNote = req.body?.adminNote || "";

  // allow user to re-upload receipt
  card.cardStatus = "submitted";

  const updated = await card.save();
  res.status(200).json(updated);
});

export {
    assertOwnerOrAdmin,
    createCard,
    updateCardDetails,
    uploadReceipt,
    getMyCards,
    getCardById,
    adminListCards,
    adminConfirmPayment,
    adminDeclinePayment
}