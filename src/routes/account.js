const express = require('express');
const router = express.Router();
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
            res.render('account', {username: result['username'], email: result['email']});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

router.post('/', limiter, async (req, res, next) => {
    const username = req.body.username || "";
    const email = req.body.email || "";
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || "";

    if (password != "" && password != confirmPassword) {
        userModel.getUser(req.session.user.id).then((result)=>{
            res.render('account', {username: result['username'], email: result['email'], confirmPasswordErr: "Password and Confirm Password must be identical"});
        });
        
        return;
    }

    if (username != "" && username != req.session.user.username) {
        var changeUser = await userModel.changeUsername(req.session.user.id, username);
    }
    if (email != "" && email != req.session.user.email) {
        var changeEmail = await userModel.changeEmail(req.session.user.id, email);
    }
    if (password != "") {
        var changePass = await userModel.changePassword(req.session.user.id, password);
    }
});

module.exports = router;