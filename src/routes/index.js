const express = require('express');
const router = express.Router();
const itemsModel = require('../model/timeItemsModel');

router.get('/', async function(req, res) {
    // Change 1 to userID
    // Event listener for delete buttons
    /* 
        <%-include('partials/icon', {src:"/assets/Delete-Icon.png", 
        alt:"A bin, clicked to delete items", text:"Delete", addClass:(item['type'] == 'Food' ? 'deleteItem Food-'+item['foodid'] : item['type'] == 'Mood' ? 'deleteItem Mood-'+item['moodid'] : 'deleteItem Sickness-'+item['sicknessid'])}) %>
                    
    */
    itemsModel.getTimeItems(1).then((result)=>{
        res.render('index', {timeItems: result});
    });
});

module.exports = router;