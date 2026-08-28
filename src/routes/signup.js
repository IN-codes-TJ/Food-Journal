const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator");
const userModel = require("../model/userModel");

router.get('/', function(req, res) {
    
    res.render("signup", {});
    
});

router.post('/', [
    check('username').notEmpty().isLength({min:3, max:128}).withMessage('Username must be at least 5 characters'),
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
            if (error['path'] == 'username') usernameErr = error;
            else if (error['path'] == 'email') emailErr = error;
            else if (error['path'] == 'password') passwordErrs.push(error);
        }

        res.render('signup', {usernameErr: usernameErr, emailErr: emailErr, passwordErrs: passwordErrs, confirmPasswordErr: confirmPasswordErr});
        return;
    } 

    // Error checking done. If no errors, we can interact with the database.

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;


    console.log(typeof username);
    console.log(typeof email);
    console.log(typeof password);
    //userModel.createUser(username, email, password)
});

module.exports = router;