const express = require("express");
const router = express.Router({ mergeParams: true });

console.log("🔥 REVIEW ROUTES LOADED");

const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn } = require("../middleware");

// ==========================================
// CREATE REVIEW
// ==========================================

router.post("/", isLoggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);

  // Logged-in user
  newReview.reviewer = req.user._id;

  // 🔥 IMPORTANT: Save which listing this review belongs to
  newReview.listing = listing._id;

  await newReview.save();

  // Add review reference to listing
  listing.reviews.push(newReview._id);
  await listing.save();

  req.flash("success", "Review Added!");

  res.redirect(`/listings/${listing._id}`);
});


// ==========================================
// DELETE REVIEW
// ONLY REVIEW OWNER
// ==========================================

router.delete("/:reviewId", isLoggedIn, async (req, res) => {

  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  // 🔐 Only review owner can delete
  if (!review.reviewer.equals(req.user._id)) {
    req.flash(
      "error",
      "You are not allowed to delete this review!"
    );

    return res.redirect(`/listings/${id}`);
  }

  // Remove review reference from listing
  await Listing.findByIdAndUpdate(id, {
    $pull: {
      reviews: reviewId
    }
  });

  // Delete actual review document
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");

  res.redirect(`/listings/${id}`);
});


module.exports = router;