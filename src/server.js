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

var indexRouter = require("./routes/index");
var foodItemRouter = require("./routes/food-item");
var moodItemRouter = require("./routes/mood-item");

app.use("/", indexRouter);
app.use("/home", indexRouter);
app.use("/food-item", foodItemRouter);
app.use("/mood-item", moodItemRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})