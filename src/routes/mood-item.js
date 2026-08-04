const express = require('express');
const router = express.Router();
const itemsModel = require('../model/itemsModel');

router.get('/', async function(req, res) {
    itemsModel.getMoodItem(req.query.id).then((result)=>{
        res.render('mood-item', {item: result['moodData'], associations: result['associations']});
    });
});

module.exports = router;