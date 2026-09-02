const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const userModel = require("../model/userModel");
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 10, // Max no. of requests
    windowMs: 5*60*1000, // 5 min rate limit time (ms)
    message: 'You have made too many login attempts. Please try again in 5 minutes.',
    handler: (req, res, next, options) => {
        res.render('blocked', {message: 'You have made too many login attempts. Please try again in 5 minutes.'});
    }
});

router.get('/', function(req, res) {
    
    res.render("login", {});
    
});

router.post('/', limiter, async (req, res, next) => {
    const emailUsername = req.body.emailUsername;
    const password = req.body.password;

    userModel.login(emailUsername, password).then((result) => {
        if (result == false || typeof result.error != "undefined") {
            res.render('login', {otherErr: 'You could not be logged in.'});
            return;
        }
        
        req.session.user = {id: result['userid'], username: (result['username'] == null) ? result['email'] : result['username']};

        res.redirect("/");
    })
});

module.exports = router;