const express = require('express');
const router = express.Router();
const timeItemsModel = require('../model/timeItemsModel');

router.get('/', async function(req, res) {
    if (typeof req.session.user == "undefined") {
        res.redirect("/signup");
        return;
    }
    
   try {
        timeItemsModel.getTimeItems(req.session.user.id).then((result)=>{
            res.render('index', {timeItems: result, username: req.session.user.username});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

module.exports = router;