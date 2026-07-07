const express = require('express');
const router = express.Router();
const itemsModel = require('../model/timeItemsModel');

router.get('/', async function(req, res) {
    // Change 1 to userID
    itemsModel.getTimeItems(1).then((result)=>{
        res.render('index', {timeItems: result});
    });
});

module.exports = router;