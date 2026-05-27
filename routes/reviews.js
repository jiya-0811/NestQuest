const express = require("express");
const router = express.Router({ mergeParams: true });

console.log("🔥 REVIEW ROUTES LOADED");

const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn } = require("../middleware");

// CREATE REVIEW
router.post("/", isLoggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  const newReview = new Review(req.body.review);
  newReview.reviewer = req.user._id;

  await newReview.save();

  listing.reviews.push(newReview);
  await listing.save();

  req.flash("success", "Review Added!");
  res.redirect(`/listings/${listing._id}`);
});

// DELETE REVIEW (ONLY REVIEW OWNER)
router.delete("/:reviewId", isLoggedIn, async (req, res) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review.reviewer.equals(req.user._id)) {
    req.flash("error", "You are not allowed to delete this review!");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
});

module.exports = router;