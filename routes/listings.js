const express = require("express");
const router = express.Router();

const listings = require("../controllers/listings");

const {
  isLoggedIn,
  validateListing
} = require("../middleware");

// 🔥 MULTER
const upload = require("../utils/multer");

console.log("LISTING ROUTES LOADED");

// ===============================
// ALL LISTINGS
// ===============================

router.get("/", listings.index);

// ===============================
// NEW LISTING FORM
// ===============================

router.get(
  "/new",
  isLoggedIn,
  listings.renderNewForm
);

// ===============================
// CREATE LISTING
// ===============================

router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  listings.createListing
);

// ===============================
// AI RECOMMENDATION
// IMPORTANT: BEFORE /:id
// ===============================

router.get(
  "/recommend/search",
  listings.recommendListings
);

// ===============================
// EDIT FORM
// ===============================

router.get(
  "/:id/edit",
  isLoggedIn,
  listings.renderEditForm
);

// ===============================
// SHOW LISTING
// ===============================

router.get(
  "/:id",
  listings.showListing
);

// ===============================
// UPDATE LISTING
// ===============================

router.put(
  "/:id",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  listings.updateListing
);

// ===============================
// DELETE LISTING
// ===============================

router.delete(
  "/:id",
  isLoggedIn,
  listings.destroyListing
);

module.exports = router;