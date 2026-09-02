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
    if (typeof req.session.user == "undefined") {
        res.redirect("/signup");
        return;
    }
    
    try {
        var foodOptions = await itemsModel.getEatenItems(req.session.user.id);
        
        if (typeof req.query.err == 'undefined' && typeof req.query.created == 'undefined') {
            res.render("create-mood", {foodOptions})
        }
        else if (typeof req.query.created != 'undefined') {
            res.render('create-mood', {created: true, foodOptions});
        }
        else {
            // An error occured
            res.render('create-mood', {error: req.query.err, foodOptions});
        }
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.post("/", limiter, async(req, res, next) => {
    const name = req.body.name;
    const description = req.body.desc || "";
    const associatedFoods = req.body.associatedFoods || "";

    var checkedAssociatedFoods = [];
    
    if (typeof associatedFoods != "undefined") {for (var food of associatedFoods) {
        if (checkedAssociatedFoods.includes(food)) {
            res.redirect("create-mood?err=asdup");
            return;
        }
        else {
            checkedAssociatedFoods.push(food);
        }
    }}

    createModel.createMood(req.session.user.id, name, description, associatedFoods).then((result)=>{
        if (result == true) {
            res.redirect("create-mood?created");
        }
        else {
            res.redirect("create-mood?err=nCreate")
        }
    });

});

module.exports = router;