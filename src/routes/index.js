const express = require('express');
const router = express.Router();
const timeItemsModel = require('../model/timeItemsModel');

router.get('/', async function(req, res) {
   try {
        timeItemsModel.getTimeItems(req.user.id).then((result)=>{
            res.render('index', {timeItems: result, username: req.user.username});
        });
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

module.exports = router;