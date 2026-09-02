require('dotenv').config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

const port = 5432;

const ejs = require("ejs");
const path = require("path");

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize()); // Initialises passport
app.use(passport.session()); //  Ensures passport integrates with the session

passport.use(
    // Callback receives user's profile
    // TODO: Save profile to database?
    new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:5432/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
));

// Save and retract user data
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Rate limiting: 200 requests every 30 minutes
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  max: 200,
  windowMs: 1000 * 60 * 30, // Rate limit time (ms)
  statusCode: 200,
  message: {
    status: 429,
    limiter: true,
    type: "error",
    message: "User Request Limit Exceeded"
  },
  handler: (req, res, next, options) => {
        res.render('blocked', {message: "User Request Limit Exceeded"});
    }
})
app.use(limiter);

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email"]})
);

var authCallbackRouter = require("./routes/authCallback");
app.use("/auth/google/callback", authCallbackRouter);

var errorRouter = require("./routes/error");
var signupRouter = require("./routes/signup");
var loginRouter = require("./routes/login");
var logoutRouter = require("./routes/logout");
var indexRouter = require("./routes/index");
var eatenItemRouter = require("./routes/eaten-item");
var moodItemRouter = require("./routes/mood-item");
var sicknessItemRouter = require("./routes/sickness-item");
var createSicknessRouter = require("./routes/create-sickness");
var createMoodRouter = require("./routes/create-mood");
var createFoodRouter = require("./routes/create-food");
var createEatenRouter = require("./routes/create-eaten");
var foodListRouter = require("./routes/food-list");
var accountRouter = require("./routes/account");

app.use("/error", errorRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/", indexRouter);
app.use("/home", indexRouter);
app.use("/eaten-item", eatenItemRouter);
app.use("/mood-item", moodItemRouter);
app.use("/sickness-item", sicknessItemRouter);
app.use("/create-sickness", createSicknessRouter);
app.use("/create-mood", createMoodRouter);
app.use("/create-food", createFoodRouter);
app.use("/create-eaten", createEatenRouter);
app.use("/food-list", foodListRouter);
app.use("/account", accountRouter);

// Error handling
app.use((req, res, next) => {
    res.redirect("/error");
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})