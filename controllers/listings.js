const Listing = require("../models/listing");
//const Review = require("../models/review"); // 🔥 ADD THIS

// 🔥 SHOW ALL
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// 🔥 NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new", { listing: {}, errorMessages: [] });
};

// 🔥 EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.send("Listing not found");

  res.render("listings/edit", { listing });
};

// 🔥 CREATE
module.exports.createListing = async (req, res) => {
  try {
    const newListing = new Listing(req.body.listing);

    // 🔥 USER ADD
    newListing.owner = req.user._id;

    if (!newListing.amenities) {
      newListing.amenities = [];
    }

    await newListing.save();

    req.flash("success", "Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    res.render("listings/new", {
      listing: req.body.listing,
      errorMessages: Object.values(err.errors).map(e => e.message)
    });
  }
};

// 🔥 SHOW ONE


module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'reviewer' } });

  // ⭐ Average Rating
  let avgRating = 0;

  if (listing.reviews.length > 0) {
    let sum = 0;
    listing.reviews.forEach(r => sum += r.rating);
    avgRating = (sum / listing.reviews.length).toFixed(1);
  }

  res.render("listings/show", { listing, avgRating });
};
// 🔥 UPDATE
module.exports.updateListing = async (req, res) => {
  try {
    const updatedData = req.body.listing;

    if (!updatedData.amenities) {
      updatedData.amenities = [];
    }

    await Listing.findByIdAndUpdate(req.params.id, updatedData, {
      runValidators: true
    });

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${req.params.id}`);

  } catch (err) {
    const listing = await Listing.findById(req.params.id);

    res.render("listings/edit", {
      listing,
      errorMessages: Object.values(err.errors).map(e => e.message)
    });
  }
};

// 🔥 DELETE
module.exports.destroyListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

// 🔥 AI RECOMMEND (same)
module.exports.recommendListings = async (req, res) => {
  try {
    const { budget, location, type, college, distance } = req.query;

    let query = {};

    // 🔥 FILTERS
    if (budget) query.price = { $lte: Number(budget) };
    if (location) query.location = new RegExp(location, "i");
    if (type) query.type = type;
    if (college) query.college = new RegExp(college, "i");
    if (distance) query.distance = { $lte: Number(distance) };

    const listings = await Listing.find(query);

    // 🔥 SMART SCORING
    const scoredListings = listings.map(l => {
      let score = 0;

      if (budget && l.price <= Number(budget)) score += 2;

      if (location && l.location?.toLowerCase().includes(location.toLowerCase()))
        score += 2;

      if (type && l.type === type) score += 2;

      if (college && l.college?.toLowerCase().includes(college.toLowerCase()))
        score += 2;

      if (distance && l.distance <= Number(distance)) score += 2;

      if (l.distance && l.distance <= 2) score += 1;

      if (l.amenities?.includes("wifi")) score += 1;

      return { ...l._doc, score };
    });

    // 🔥 SORT BEST FIRST
    scoredListings.sort((a, b) => b.score - a.score);

    res.render("listings/recommend", {
      listings: scoredListings,
      filters: { budget, location, type, college, distance }
    });

  } catch (err) {
    console.log("RECOMMEND ERROR:", err);
    res.send("Error loading recommendations");
  }
};