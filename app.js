const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");

const app = express();

// 🔥 ROUTES
const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");

// 🔥 DB CONNECT
mongoose.connect("mongodb://127.0.0.1:27017/rentalSystem")
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// 🔥 VIEW ENGINE
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 🔥 MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// 🔥 SESSION CONFIG (VERY IMPORTANT)
const sessionConfig = {
  secret: "mysupersecretkey",
  resave: false,
  saveUninitialized: false
};

app.use(session(sessionConfig));
app.use(flash());

// 🔥 PASSPORT SETUP (MOST IMPORTANT)
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 🔥 GLOBAL VARIABLES (IMPORTANT)
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// 🔥 ROUTES
app.use("/", authRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

// HOME
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});