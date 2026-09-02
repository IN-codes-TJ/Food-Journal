const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const userModel = require("../model/userModel");
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 10, // Max no. of requests
    windowMs: 2*60*1000, // 2 min rate limit time (ms)
    message: 'You have made too many signup attempts. Please try again in 2 minutes.',
    handler: (req, res, next, options) => {
        res.render('blocked', {message: 'You have made too many signup attempts. Please try again in 2 minutes.'});
    }
});

router.get('/', function(req, res) {
    
    res.render("signup", {});
    
});

router.post('/', limiter, [
    check('username').notEmpty().isLength({min:3, max:128}).withMessage('Username must be at least 5 characters').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}), // Username is optional
    check('email').notEmpty().isEmail().withMessage('Invalid email format'),
    check('password').notEmpty().isLength({min:5, max:256}).withMessage('Password must be at least 5 characters'),
    check('password').notEmpty().matches(/\S*[a-z]\S*/).withMessage('Password must include a lowercase letter'),
    check('password').notEmpty().matches(/\S*[A-Z]\S*/).withMessage('Password must include a uppercase letter'),
    check('password').notEmpty().matches(/\S*[0-9]\S*/).withMessage('Password must include a digit'),
    check('password').notEmpty().matches(/\S*[!.@#$£%^&*\-_=+?]\S*/).withMessage('Password must include a special character')
], async (req, res, next) => {
    var confirmPasswordErr;
    if (req.body.password != req.body.confirmPassword) confirmPasswordErr = 'Passwords do not match'; // Checking that "confirm password" matches "password"

    // Alert the user of any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty() || confirmPasswordErr) {
        const alert = errors.array();
        var usernameErr;
        var emailErr;
        var passwordErrs = []; // Array of the various password errors
        

        for (const error of alert) {
            if (error['path'] == 'username') usernameErr = error.msg;
            else if (error['path'] == 'email') emailErr = error.msg;
            else if (error['path'] == 'password') passwordErrs.push(error.msg);
        }
        
        res.render('signup', {usernameErr: usernameErr, emailErr: emailErr, passwordErrs: passwordErrs, confirmPasswordErr: confirmPasswordErr});
        return;
    } 

    // Error checking done. If no errors, we can interact with the database.

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    userModel.createUser(email, username, password).then((result) => {
        if (result == false || typeof result.error != "undefined") {
            res.render('signup', {otherErr: 'Your account could not be created'});
            return;
        }
        else if (typeof result.message != "undefined") {
            res.render('signup', {emailErr: result.message});
            return;
        }
        
        req.session.user = {id: result['userid'], username: (result['username'] == null) ? result['email'] : result['username']};

        res.redirect("/");
    })
});

module.exports = router;