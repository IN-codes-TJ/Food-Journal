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

        var foodID = req.query.id;
        var foodData = await itemsModel.getFoodItem(foodID);
        
        if (typeof req.query.err == 'undefined' && typeof req.query.created == 'undefined') {
            res.render("create-eaten", {food: foodData['foodData'], ingredients: foodData['ingredients']})
        }
        else if (typeof req.query.created != 'undefined') {
            res.render('create-eaten', {created: true, food});
        }
        else {
            // An error occured
            res.render('create-eaten', {error: req.query.err, food});
        }
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.post("/", limiter, async(req, res, next) => {
    var userID = 1;

    const checked = req.body.checked || "";
    const unchecked = req.body.unchecked || "";
    const modifications = req.body.modifications || "";
    console.log("checked: " + checked);
    console.log("unchecked: " + unchecked);
    console.log("modifications: "+modifications);

    //TODO: Styling for checked and unchecked

    /*createModel.createEatenFood(userID, name, ingredients, modifications).then((result)=>{
        if (result == true) {
            res.redirect("create-eaten?created");
        }
        else {
            res.redirect("create-eaten?err=nCreate")
        }
    });*/

});

module.exports = router;