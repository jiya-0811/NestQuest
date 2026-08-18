const express = require("express");

const router = express.Router();

const listings = require("../controllers/listings");

const {
  isLoggedIn,
  isOwner,
  validateListing
} = require("../middleware");

// 🔥 MULTER
const upload = require("../utils/multer");

console.log("LISTING ROUTES LOADED");


// ===============================
// ALL LISTINGS
// ===============================

router.get(
  "/",
  listings.index
);


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
// ❤️ MY FAVORITES
// IMPORTANT: BEFORE /:id
// ===============================

router.get(
  "/favorites",
  isLoggedIn,
  listings.showFavorites
);


// ===============================
// ❤️ SAVE FAVORITE
// ===============================

router.post(
  "/:id/favorite",
  isLoggedIn,
  listings.addFavorite
);


// ===============================
// 💔 REMOVE FAVORITE
// ===============================

router.delete(
  "/:id/favorite",
  isLoggedIn,
  listings.removeFavorite
);


// ===============================
// ✏️ EDIT FORM
// OWNER ONLY
// ===============================

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
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
// ✏️ UPDATE LISTING
// OWNER ONLY
// ===============================

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  validateListing,
  listings.updateListing
);


// ===============================
// 🗑️ DELETE LISTING
// OWNER ONLY
// ===============================

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  listings.destroyListing
);


// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;