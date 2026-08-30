const express = require('express');
const router = express.Router();
const itemsModel = require("../model/itemsModel");

router.get('/', async function(req, res) {
    if (typeof req.user?.id == "undefined") {
        res.redirect("/signup");
        return;
    }

    try {
        itemsModel.getFoodItems(req.user.id).then((result)=>{
            res.render('food-list', {foods: result});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

module.exports = router;