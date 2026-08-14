const Joi = require("joi");

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }

  next();
};


// ===============================
// JOI LISTING VALIDATION
// ===============================

const listingJoiSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string()
      .required(),

    description: Joi.string()
      .required(),

    price: Joi.number()
      .min(1)
      .required(),

    location: Joi.string()
      .required(),

    country: Joi.string()
      .required(),

    college: Joi.string()
      .required(),

    type: Joi.string()
      .valid("single", "shared", "flat")
      .required(),

    distance: Joi.number()
      .min(0)
      .required(),

    amenities: Joi.array()
      .items(
        Joi.string().valid(
          "wifi",
          "food",
          "parking",
          "laundry"
        )
      )
      .default([])

  }).required()
});


// ===============================
// VALIDATE LISTING
// ===============================

module.exports.validateListing = (req, res, next) => {

  console.log("🔥 JOI VALIDATION HIT");
  console.log("REQUEST BODY:", req.body);

  const { error } = listingJoiSchema.validate(req.body);

  if (error) {
    const message = error.details
      .map((detail) => detail.message)
      .join(", ");

    console.log("❌ JOI ERROR:", message);

    req.flash("error", message);

    console.log("🔥 FLASH SET:", req.session.flash);

    return res.redirect("/listings/new");
  }

  next();
};