const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {
    req.logout(() => {
        res.redirect("/signup");
    });
});

module.exports = router;