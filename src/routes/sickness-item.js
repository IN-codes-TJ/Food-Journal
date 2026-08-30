const express = require('express');
const router = express.Router();
const itemsModel = require('../model/itemsModel');

router.get('/', async function(req, res) {
    if (typeof req.user?.id == "undefined") {
        res.redirect("/signup");
        return;
    }

    try {
        itemsModel.getSicknessItem(req.query.id).then((result)=>{
            if (typeof result['error'] != 'undefined') {res.redirect("/error")};
            res.render('sickness-item', {item: result['sicknessData'], symptoms: result['symptoms'], associations: result['associations']});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

module.exports = router;