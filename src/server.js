require('dotenv').config();

const express = require("express");
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

var errorRouter = require("./routes/error");
var indexRouter = require("./routes/index");
var eatenItemRouter = require("./routes/eaten-item");
var moodItemRouter = require("./routes/mood-item");
var sicknessItemRouter = require("./routes/sickness-item");
var createSicknessRouter = require("./routes/create-sickness");
var createMoodRouter = require("./routes/create-mood");
var foodListRouter = require("./routes/food-list");

app.use("/error", errorRouter);
app.use("/", indexRouter);
app.use("/home", indexRouter);
app.use("/eaten-item", eatenItemRouter);
app.use("/mood-item", moodItemRouter);
app.use("/sickness-item", sicknessItemRouter);
app.use("/create-sickness", createSicknessRouter);
app.use("/create-mood", createMoodRouter);
app.use("/food-list", foodListRouter);

// Error handling
app.use((req, res, next) => {
    res.redirect("/error");
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})