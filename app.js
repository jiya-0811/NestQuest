require("dotenv").config();

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


// ==========================================
// ROUTES
// ==========================================

const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");


// ==========================================
// DATABASE CONNECTION
// ==========================================

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ DB Connected");
  })
  .catch((err) => {
    console.log("❌ Database Connection Error:", err);
  });


// ==========================================
// VIEW ENGINE
// ==========================================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// ==========================================
// SESSION
// ==========================================

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
};

app.use(session(sessionConfig));


// ==========================================
// FLASH
// ==========================================

app.use(flash());


// ==========================================
// PASSPORT
// ==========================================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ==========================================
// GLOBAL VARIABLES
// ==========================================

app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});


// ==========================================
// ROUTES
// ==========================================

app.use("/", authRoutes);

app.use("/listings", listingRoutes);

app.use("/listings/:id/reviews", reviewRoutes);


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.redirect("/listings");
});


// ==========================================
// 404
// ==========================================

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ==========================================
// CENTRAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  const {
    statusCode = 500,
    message = "Something went wrong!"
  } = err;

  res.status(statusCode).send(message);
});
// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});