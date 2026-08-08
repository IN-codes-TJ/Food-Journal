const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 3, // Max no. of requests
    windowMs: 5*60*1000, // Rate limit time (ms)
    message: 'Too many attempts. Please try again later.',
    handler: (req, res, next, options) => {res.render('blocked', {blocked:true})}
});

const createModel = require('../model/createModel');
const itemsModel = require('../model/itemsModel');

router.get('/', async function(req, res) {
    try {
        var userID = 1;
        var foodOptions = await itemsModel.getFoodItems(userID);
        
        if (typeof req.query.created == 'undefined') {
            res.render("create-sickness", {foodOptions})
        }
        else {
            res.render('create-sickness', {created: true, foodOptions});
        }
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.post("/", limiter, async(req, res, next) => {
    const name = req.body.name;
    const time = req.body.time;
    const description = req.body.description;
    // Get symptoms
    // Get associated foods
});

module.exports = router;