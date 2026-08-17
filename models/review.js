const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  comment: String,

  rating: Number,

  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // 🔥 Listing to which this review belongs
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing"
  }
});

module.exports = mongoose.model("Review", reviewSchema);