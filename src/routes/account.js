const express = require('express');
const router = express.Router();
const userModel = require('../model/userModel');

router.get('/', async function(req, res) {
    if (typeof req.session.user == "undefined") {
        res.redirect("/signup");
        return;
    }
    
   try {
        userModel.getUser(req.session.user.id).then((result)=>{
            console.log(result)
            res.render('account', {username: result['username'], email: result['email']});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

module.exports = router;