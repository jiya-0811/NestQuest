const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

// ==========================================
// SHOW ALL LISTINGS
// ==========================================

module.exports.index = wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});

  res.render("listings/index", { allListings });
});


// ==========================================
// NEW LISTING FORM
// ==========================================

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new", {
    listing: {},
    errorMessages: []
  });
};


// ==========================================
// EDIT LISTING FORM
// ==========================================

module.exports.renderEditForm = wrapAsync(async (req, res) => {

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  res.render("listings/edit", { listing });
});


// ==========================================
// CREATE LISTING
// ==========================================

module.exports.createListing = wrapAsync(async (req, res) => {

  console.log("🔥 CREATE LISTING HIT");
  console.log("📦 REQUEST BODY:", req.body);
  console.log("🖼️ UPLOADED FILE:", req.file);

  const newListing = new Listing(req.body.listing);

  // Add logged-in user as owner
  newListing.owner = req.user._id;

  // Default amenities
  if (!newListing.amenities) {
    newListing.amenities = [];
  }

  // ==========================================
  // CLOUDINARY IMAGE
  // ==========================================

  if (req.file) {
    console.log("☁️ CLOUDINARY FILE RECEIVED");

    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  } else {
    console.log("⚠️ NO IMAGE RECEIVED");
  }

  await newListing.save();

  console.log("✅ LISTING SAVED SUCCESSFULLY");

  req.flash("success", "Listing Created!");

  res.redirect("/listings");
});


// ==========================================
// SHOW ONE LISTING
// ==========================================

module.exports.showListing = wrapAsync(async (req, res) => {

  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "reviewer"
      }
    });

  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  // ⭐ Average Rating
  let avgRating = 0;

  if (listing.reviews.length > 0) {

    let sum = 0;

    listing.reviews.forEach((r) => {
      sum += r.rating;
    });

    avgRating = (sum / listing.reviews.length).toFixed(1);
  }

  res.render("listings/show", {
    listing,
    avgRating
  });
});


// ==========================================
// UPDATE LISTING
// ==========================================

module.exports.updateListing = wrapAsync(async (req, res) => {

  const updatedData = req.body.listing;

  if (!updatedData.amenities) {
    updatedData.amenities = [];
  }

  const updatedListing = await Listing.findByIdAndUpdate(
    req.params.id,
    updatedData,
    {
      runValidators: true,
      new: true
    }
  );

  if (!updatedListing) {
    throw new ExpressError("Listing not found", 404);
  }

  req.flash("success", "Listing Updated!");

  res.redirect(`/listings/${req.params.id}`);
});


// ==========================================
// DELETE LISTING
// ==========================================

module.exports.destroyListing = wrapAsync(async (req, res) => {

  const deletedListing = await Listing.findByIdAndDelete(req.params.id);

  if (!deletedListing) {
    throw new ExpressError("Listing not found", 404);
  }

  req.flash("success", "Listing Deleted!");

  res.redirect("/listings");
});


// ==========================================
// SMART RECOMMENDATION
// ==========================================

module.exports.recommendListings = wrapAsync(async (req, res) => {

  const {
    budget,
    location,
    type,
    college,
    distance
  } = req.query;

  let query = {};

  // ========================================
  // FILTERS
  // ========================================

  if (budget) {
    query.price = {
      $lte: Number(budget)
    };
  }

  if (location) {
    query.location = new RegExp(location, "i");
  }

  if (type) {
    query.type = type;
  }

  if (college) {
    query.college = new RegExp(college, "i");
  }

  if (distance) {
    query.distance = {
      $lte: Number(distance)
    };
  }


  // ========================================
  // FIND LISTINGS
  // ========================================

  const listings = await Listing.find(query);


  // ========================================
  // SMART SCORING
  // ========================================

  const scoredListings = listings.map((l) => {

    let score = 0;

    if (budget && l.price <= Number(budget)) {
      score += 2;
    }

    if (
      location &&
      l.location?.toLowerCase().includes(location.toLowerCase())
    ) {
      score += 2;
    }

    if (type && l.type === type) {
      score += 2;
    }

    if (
      college &&
      l.college?.toLowerCase().includes(college.toLowerCase())
    ) {
      score += 2;
    }

    if (distance && l.distance <= Number(distance)) {
      score += 2;
    }

    // Near college bonus
    if (l.distance && l.distance <= 2) {
      score += 1;
    }

    // WiFi bonus
    if (l.amenities?.includes("wifi")) {
      score += 1;
    }

    return {
      ...l._doc,
      score
    };
  });


  // ========================================
  // SORT BEST FIRST
  // ========================================

  scoredListings.sort((a, b) => b.score - a.score);


  // ========================================
  // RENDER
  // ========================================

  res.render("listings/recommend", {
    listings: scoredListings,
    filters: {
      budget,
      location,
      type,
      college,
      distance
    }
  });
});