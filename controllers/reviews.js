const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  console.log("🔥 REVIEW ROUTE HIT"); // 👈 ADD THIS

  const listing = await Listing.findById(req.params.id);

  const newReview = new Review(req.body.review);

  // 🔥 MUST
  newReview.reviewer = req.user._id;

  await newReview.save();

  listing.reviews.push(newReview);
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
};