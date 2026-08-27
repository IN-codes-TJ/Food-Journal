const express = require('express');
const passport = require("passport");
const router = express.Router();
const userModel = require('../model/userModel');

router.get("/",
    passport.authenticate("google", {failureRedirect: "/signup"}), (req, res) => {
        // Successfull authentication
        userModel.createUser(req.user.emails[0]['value'], undefined, undefined).then((result)=>{
            req.user.id = result['userid'];
            req.user.username = (result['username'] == null) ? result['email'] : result['username'];
            res.redirect("/");
        });
    }
)

module.exports = router;