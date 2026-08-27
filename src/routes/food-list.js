const express = require('express');
const router = express.Router();
const itemsModel = require("../model/itemsModel");

router.get('/', async function(req, res) {
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