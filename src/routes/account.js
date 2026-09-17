const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const userModel = require('../model/userModel');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 10, // Max no. of requests
    windowMs: 5*60*1000, // 5 min rate limit time (ms)
    message: 'You have made too many account change attempts. Please try again in 5 minutes.',
    handler: (req, res, next, options) => {
        res.render('blocked', {message: 'You have made too many account change attempts. Please try again in 5 minutes.'});
    }
});

router.get('/', async function(req, res) {
    if (typeof req.session.user == "undefined") {
        res.redirect("/signup");
        return;
    }
    
   try {
        userModel.getUser(req.session.user.id).then((result)=>{
            res.render('account', {username: result['username'], email: result['email'], successfullyChanged: req.query.s});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.post('/', limiter, [
    check('username').notEmpty().isLength({min:3, max:128}).withMessage('Username must be at least 5 characters').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}), // Username check only if username present
    check('email').notEmpty().isEmail().withMessage('Invalid email format').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}), // Email check only if email present
    check('password').notEmpty().isLength({min:5, max:256}).withMessage('Password must be at least 5 characters').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}), // Password check only if password present
    check('password').notEmpty().matches(/\S*[a-z]\S*/).withMessage('Password must include a lowercase letter').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}), // Password check only if password present
    check('password').notEmpty().matches(/\S*[A-Z]\S*/).withMessage('Password must include a uppercase letter').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}), // Password check only if password present
    check('password').notEmpty().matches(/\S*[0-9]\S*/).withMessage('Password must include a digit').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}), // Password check only if password present
    check('password').notEmpty().matches(/\S*[!.@#$£%^&*\-_=+?]\S*/).withMessage('Password must include a special character').optional({
        values: 'undefined' | 'null' | 'falsy', nullable: true, checkFalsy: true}) // Password check only if password present
], async (req, res, next) => {
    const username = req.body.username || "";
    const email = req.body.email || "";
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || "";
    var confirmPasswordErr = "";

    if (password != "" && password != confirmPassword) {
        confirmPasswordErr = "Password and Confirm Password must be identical";
    }
    
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

        userModel.getUser(req.session.user.id).then((result)=>{
            res.render('account', {username: result['username'], email: result['email'], successfullyChanged: req.query.s,
                usernameErr: usernameErr, emailErr: emailErr, 
                passwordErrs: passwordErrs, confirmPasswordErr: confirmPasswordErr});
        });
        return;
    }

    if (username != "" && username != req.session.user.username) {
        var changeUser = await userModel.changeUsername(req.session.user.id, username);
    }
    if (email != "") {
        var changeEmail = await userModel.changeEmail(req.session.user.id, email);
    }
    if (password != "") {
        var changePass = await userModel.changePassword(req.session.user.id, password);
    }

    
    if (changeUser == false || changeEmail == false || changePass == false) {
        res.redirect("/account?s=false");
        return;
    }
    else res.redirect("/account?s=true");
});

module.exports = router;