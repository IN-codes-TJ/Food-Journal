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
    if (typeof req.user?.id == "undefined") {
        res.redirect("/signup");
        return;
    }
    
    try {
        var foodID = req.query.id;
        var foodData = await itemsModel.getFoodItem(foodID);
        
        if (typeof req.query.err == 'undefined' && typeof req.query.created == 'undefined') {
            res.render("create-eaten", {food: foodData['foodData'], ingredients: foodData['ingredients'], href: "create-eaten?id="+foodID})
        }
        else if (typeof req.query.created != 'undefined') {
            res.render('create-eaten', {created: true, food: foodData['foodData'], ingredients: foodData['ingredients'], href: "create-eaten?id="+foodID});
        }
        else {
            // An error occured
            res.render('create-eaten', {error: req.query.err, food:foodData['foodData'], ingredients: foodData['ingredients'], href: "create-eaten?id="+foodID});
        }
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.post("/", limiter, async(req, res, next) => {
    const foodID = req.query.id;

    const unchecked = req.body.unchecked || "";
    const modifications = req.body.modifications || "";
    const opinion = req.body.opinion;

    createModel.createEatenFood(req.user.id, foodID, unchecked, modifications, opinion).then((result)=>{
        if (result == true) {
            res.redirect("create-eaten?id="+foodID+"&created");
        }
        else {
            res.redirect("create-eaten?id="+foodID+"&err=nCreate")
        }
    });

});

module.exports = router;