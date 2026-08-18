const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Review = require("./review");


const listingSchema = new Schema({

  title: {
    type: String,
    required: [true, "Title is required"]
  },


  description: {
    type: String,
    required: [true, "Description is required"]
  },


  image: {

    filename: String,

    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1625505826533-5c80aca7d157"
    }

  },


  price: {

    type: Number,

    required: [true, "Price is required"],

    min: [
      1,
      "Price must be at least 1"
    ]

  },


  location: {
    type: String,
    required: [true, "Location is required"]
  },


  country: {
    type: String,
    required: [true, "Country is required"]
  },


  // ===============================
  // COLLEGE
  // ===============================

  college: {

    type: String,

    required: [
      true,
      "College name is required"
    ]

  },


  // ===============================
  // AI FIELDS
  // ===============================

  type: {

    type: String,

    enum: [
      "single",
      "shared",
      "flat"
    ],

    required: true

  },


  amenities: {

    type: [String],

    default: []

  },


  distance: {

    type: Number,

    required: [
      true,
      "Distance is required"
    ]

  },


  // ===============================
  // REVIEWS
  // ===============================

  reviews: [

    {

      type: mongoose.Schema.Types.ObjectId,

      ref: "Review"

    }

  ],


  // ===============================
  // OWNER
  // ===============================

  owner: {

    type: mongoose.Schema.Types.ObjectId,

    ref: "User"

  }

});


// ==========================================
// DELETE ASSOCIATED REVIEWS
// ==========================================

listingSchema.post(
  "findOneAndDelete",
  async function (listing) {

    if (listing) {

      await Review.deleteMany({

        _id: {
          $in: listing.reviews
        }

      });

    }

  }
);


module.exports = mongoose.model(
  "Listing",
  listingSchema
);