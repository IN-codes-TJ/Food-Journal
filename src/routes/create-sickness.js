const express = require('express');
const router = express.Router();
const createModel = require('../model/createModel');

router.get('/', async function(req, res) {
    try {
        if (typeof req.query.created == 'undefined') {
            res.render("create-sickness", {})
        }
        else {
            createModel.createSickness(req.query.id).then((result)=>{
                res.render('create-sickness', {created: true});
            });
        }
    }
    catch (error) {
        console.error(error);
        res.render('error');
    }
});

module.exports = router;