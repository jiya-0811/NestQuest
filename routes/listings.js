const express = require("express");
const router = express.Router();
const listings = require("../controllers/listings");
    console.log("LISTING ROUTES LOADED");
// ALL
router.get("/", listings.index);

// NEW
router.get("/new", listings.renderNewForm);
//EDIT
//router.get("/:id/edit", listings.renderEditForm);
router.get("/:id/edit", 
 // console.log("EDIT ROUTE HIT"); // 👈 DEBUG
  //res.send("Edit page working");
  listings.renderEditForm);

// CREATE
router.post("/", listings.createListing);

// 🔥 IMPORTANT: recommend पहले
router.get("/recommend/search", listings.recommendListings);

// SHOW (LAST में होना चाहिए)
router.get("/:id", listings.showListing);

//edit
router.put("/:id", listings.updateListing);

// DELETE
router.delete("/:id", listings.destroyListing);

module.exports = router;