const Joi = require("joi");


// ==========================================
// LISTING VALIDATION SCHEMA
// ==========================================

const listingSchema = Joi.object({

  title: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Title is required",
      "any.required": "Title is required"
    }),

  description: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Description is required",
      "any.required": "Description is required"
    }),

  price: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Price must be a number",
      "number.positive": "Price must be greater than 0",
      "any.required": "Price is required"
    }),

  location: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Location is required",
      "any.required": "Location is required"
    }),

  country: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Country is required",
      "any.required": "Country is required"
    }),

  college: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "College name is required",
      "any.required": "College name is required"
    }),

  type: Joi.string()
    .valid("single", "shared", "flat")
    .required()
    .messages({
      "any.only": "Type must be single, shared, or flat",
      "any.required": "Property type is required"
    }),

  amenities: Joi.array()
    .items(
      Joi.string().valid(
        "wifi",
        "food",
        "parking",
        "laundry",
        "security"
      )
    )
    .default([]),

  distance: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Distance must be a number",
      "number.min": "Distance cannot be negative",
      "any.required": "Distance from college is required"
    }),

  image: Joi.object({
    filename: Joi.string().allow(""),
    url: Joi.string().uri().allow("")
  }).optional()

});


module.exports = {
  listingSchema
};