const express = require('express');
const router = express.Router();
const dummyModel = require('../model/dummy');

router.get('/', async function(req, res) {
    dummyModel.testMethod().then((result)=>{
        res.render('index', {testData: "Initial Setup"});
    });
});

module.exports = router;