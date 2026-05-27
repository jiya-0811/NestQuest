const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// SIGNUP PAGE
router.get("/signup", (req, res) => {
  res.render("users/signup");
});
 
// SIGNUP LOGIC
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Signup successful!");
      res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

// LOGIN PAGE
router.get("/login", (req, res) => {
  res.render("users/login");
});

// LOGIN LOGIC
router.post("/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  (req, res) => {
    console.log("AFTER LOGIN:", req.user); // 👈 DEBUG

    req.flash("success", "Welcome!");
    res.redirect("/listings");
  }
);

// LOGOUT
router.post("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success", "Logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;