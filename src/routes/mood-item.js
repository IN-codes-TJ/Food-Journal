const express = require('express');
const router = express.Router();
const itemsModel = require('../model/itemsModel');

router.get('/', async function(req, res) {
    if (typeof req.session.user == "undefined") {
        res.redirect("/signup");
        return;
    }

    try {
        itemsModel.getMoodItem(req.query.id).then((result)=>{
            if (typeof result['error'] != 'undefined') {res.redirect("/error")};
            res.render('mood-item', {item: result['moodData'], associations: result['associations']});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

module.exports = router;