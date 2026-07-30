const express = require('express');
const router = express.Router();
const itemsModel = require('../model/itemsModel');

router.get('/', async function(req, res) {
    itemsModel.getFoodItem(req.query.id).then((result)=>{
        console.log(result);
        res.render('food-item', {item: result['foodData'], ingredients: result['ingredients']});
    });
});

module.exports = router;