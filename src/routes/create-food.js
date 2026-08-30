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

router.get('/', async function(req, res) {
    if (typeof req.user?.id == "undefined") {
        res.redirect("/signup");
        return;
    }
    
    try {
        if (typeof req.query.err == 'undefined' && typeof req.query.created == 'undefined') {
            res.render("create-food")
        }
        else if (typeof req.query.created != 'undefined') {
            res.render('create-food', {created: true});
        }
        else {
            // An error occured
            res.render('create-food', {error: req.query.err});
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
    const ingredients = req.body.ingredient || "";
    
    createModel.createFood(req.user.id, name, description, ingredients).then((result)=>{
        if (result == true) {
            res.redirect("create-food?created");
        }
        else {
            res.redirect("create-food?err=nCreate")
        }
    });

});

module.exports = router;