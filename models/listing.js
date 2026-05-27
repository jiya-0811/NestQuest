const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: [true, "Title is required"] },

  description: { type: String, required: [true, "Description is required"] },

  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1625505826533-5c80aca7d157",
    },
  },

  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [1, "Price must be at least 1"],
  },

  location: { type: String, required: [true, "Location is required"] },

  country: { type: String, required: [true, "Country is required"] },

  // 🔥 NEW FIELD (IMPORTANT)
  college: {
    type: String,
    required: [true, "College name is required"],
  },

  // 🔥 AI FIELDS
  type: {
    type: String,
    enum: ["single", "shared", "flat"],
    required: true,
  },

  amenities: {
    type: [String],
    default: [],
  },

  distance: {
    type: Number,
    required: [true, "Distance is required"], // km from college
  },
  reviews: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
],
owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
});

module.exports = mongoose.model("Listing", listingSchema);