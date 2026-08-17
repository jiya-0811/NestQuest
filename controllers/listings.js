const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

// ==========================================
// SHOW ALL LISTINGS
// ==========================================

// ==========================================
// SHOW ALL LISTINGS + BASIC SEARCH
// ==========================================

module.exports.index = wrapAsync(async (req, res) => {

  const {
    search,
    budget,
    type,
    sort
  } = req.query;

  let query = {};

  // ==========================================
  // SEARCH BY TITLE / LOCATION / COLLEGE
  // ==========================================

  if (search) {

    query.$or = [
      { title: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
      { college: new RegExp(search, "i") }
    ];

  }

  // ==========================================
  // MAX BUDGET
  // ==========================================

  if (budget) {

    query.price = {
      $lte: Number(budget)
    };

  }

  // ==========================================
  // TYPE
  // ==========================================

  if (type) {

    query.type = type;

  }

  // ==========================================
  // SORT
  // ==========================================

  let sortOption = {};

  if (sort === "priceLow") {

    sortOption.price = 1;

  } else if (sort === "priceHigh") {

    sortOption.price = -1;

  } else if (sort === "distance") {

    sortOption.distance = 1;

  } else {

    sortOption._id = -1;

  }

  // ==========================================
  // FIND LISTINGS
  // ==========================================

  const allListings = await Listing
    .find(query)
    .sort(sortOption);

  // ==========================================
  // RENDER
  // ==========================================

  res.render("listings/index", {

    allListings,

    filters: {
      search: search || "",
      budget: budget || "",
      type: type || "",
      sort: sort || ""
    }

  });

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

  // Default amenities
  if (!updatedData.amenities) {
    updatedData.amenities = [];
  }

  // Find listing
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ExpressError("Listing not found", 404);
  }

  // Update text/form data
  Object.assign(listing, updatedData);

  // ==========================================
  // UPDATE IMAGE IF NEW IMAGE IS PROVIDED
  // ==========================================

  if (req.file) {

    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };

  }

  await listing.save();

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

// ==========================================
// SMART RECOMMENDATION
// ==========================================

module.exports.recommendListings = wrapAsync(async (req, res) => {

  const {
    budget,
    location,
    type,
    college,
    distance,
    amenities
  } = req.query;


  // ==========================================
  // NORMALIZE AMENITIES
  // ==========================================

  let selectedAmenities = [];

  if (amenities) {

    if (Array.isArray(amenities)) {

      selectedAmenities = amenities;

    } else {

      selectedAmenities = [amenities];

    }

  }


  // ==========================================
  // BUILD DATABASE FILTER
  // ==========================================

  let query = {};


  // Budget filter

  if (budget) {

    query.price = {
      $lte: Number(budget)
    };

  }


  // Location filter

  if (location) {

    query.location = new RegExp(location, "i");

  }


  // Type filter

  if (type) {

    query.type = type;

  }


  // College filter

  if (college) {

    query.college = new RegExp(college, "i");

  }


  // Distance filter

  if (distance) {

    query.distance = {
      $lte: Number(distance)
    };

  }


  // ==========================================
  // FIND LISTINGS
  // ==========================================

  const listings = await Listing.find(query);


  // ==========================================
  // MAX POSSIBLE SCORE
  // ==========================================

  let maxScore = 0;

  if (budget) maxScore += 2;

  if (location) maxScore += 2;

  if (type) maxScore += 2;

  if (college) maxScore += 2;

  if (distance) maxScore += 2;

  // Each selected amenity can give +2

  maxScore += selectedAmenities.length * 2;

  // Near college bonus

  maxScore += 1;


  // Prevent division by zero

  if (maxScore === 0) {
    maxScore = 1;
  }


  // ==========================================
  // SMART SCORING
  // ==========================================

  const scoredListings = listings.map((l) => {

    let score = 0;

    const listingAmenities = l.amenities || [];

    let matchedPreferences = [];

    let matchedAmenities = [];


    // ==========================================
    // BUDGET MATCH
    // ==========================================

    if (
      budget &&
      l.price <= Number(budget)
    ) {

      score += 2;

      matchedPreferences.push(
        `Within your ₹${budget} budget`
      );

    }


    // ==========================================
    // LOCATION MATCH
    // ==========================================

    if (
      location &&
      l.location?.toLowerCase().includes(
        location.toLowerCase()
      )
    ) {

      score += 2;

      matchedPreferences.push(
        "Preferred location"
      );

    }


    // ==========================================
    // TYPE MATCH
    // ==========================================

    if (
      type &&
      l.type === type
    ) {

      score += 2;

      matchedPreferences.push(
        "Preferred room type"
      );

    }


    // ==========================================
    // COLLEGE MATCH
    // ==========================================

    if (
      college &&
      l.college?.toLowerCase().includes(
        college.toLowerCase()
      )
    ) {

      score += 2;

      matchedPreferences.push(
        "Preferred college"
      );

    }


    // ==========================================
    // DISTANCE MATCH
    // ==========================================

    if (
      distance &&
      l.distance <= Number(distance)
    ) {

      score += 2;

      matchedPreferences.push(
        `Within ${distance} km`
      );

    }


    // ==========================================
    // AMENITIES MATCH
    // ==========================================

    selectedAmenities.forEach((amenity) => {

      if (
        listingAmenities.includes(amenity)
      ) {

        score += 2;

        matchedAmenities.push(amenity);

      }

    });


    // ==========================================
    // NEAR COLLEGE BONUS
    // ==========================================

    if (
      l.distance !== undefined &&
      l.distance <= 2
    ) {

      score += 1;

      matchedPreferences.push(
        "Very close to college"
      );

    }


    // ==========================================
    // MATCH PERCENTAGE
    // ==========================================

    const matchPercentage = Math.min(
      100,
      Math.round((score / maxScore) * 100)
    );


    // ==========================================
    // RETURN LISTING
    // ==========================================

    return {

      ...l._doc,

      score,

      matchPercentage,

      matchedPreferences,

      matchedAmenities

    };

  });


  // ==========================================
  // SORT BEST MATCH FIRST
  // ==========================================

  scoredListings.sort((a, b) => {

    if (b.score !== a.score) {

      return b.score - a.score;

    }

    // If score is same,
    // prefer cheaper listing

    return a.price - b.price;

  });


  // ==========================================
  // IDENTIFY BEST MATCH
  // ==========================================

  if (scoredListings.length > 0) {

    scoredListings[0].isBestMatch = true;

  }


  // ==========================================
  // RENDER RESULTS
  // ==========================================

  res.render("listings/recommend", {

    listings: scoredListings,

    filters: {

      budget,
      location,
      type,
      college,
      distance,
      amenities: selectedAmenities

    }

  });

});