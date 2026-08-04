const express = require('express');
const router = express.Router();
const itemsModel = require('../model/itemsModel');

router.get('/', async function(req, res) {
    try {
        itemsModel.getFoodItem(req.query.id).then((result)=>{
            if (typeof result['error'] != 'undefined') {res.redirect("/error")};
            res.render('food-item', {item: result['foodData'], ingredients: result['ingredients'], effects: result['effects']});
        });
    }
    catch (error) {
        console.error(error);
        console.log("im heere");
        res.render('error');
    }
});

module.exports = router;