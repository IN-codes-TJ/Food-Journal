const connect = require("../connect");
const express = require('express');

class itemsModel {
   async getTimeItems(userID) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);

         // Get all data (foods, moods and sicknesses), ordered and grouped
         // by time, to the nearest hour
         
         var timeItems = []; // {['time': 'tt:tt', 'items': [items]]}

         // Food data
         var foods = await connect.pool.query(
            "SELECT *, 'Food' as type FROM eatenData WHERE userID = $1 ORDER BY timeEaten ASC",
            [userID]
         );
         var foodsJsonRes = JSON.parse(JSON.stringify(foods.rows));

         console.log("Foods: ");
         console.log(foodsJsonRes);

         var inserted = false;
         for (var food of foodsJsonRes) {
            inserted = false;
            for (let i = 0; i < timeItems.length; i++) {
               if (timeItems[i]['time'] == food['timeeaten'].slice(0, 2)) {
                  timeItems[i]['items'].push(food);
                  inserted = true;
                  break;
               }
            }
            if (!inserted) {
               timeItems.push({
                  'time' : food['timeeaten'].slice(0, 2),
                  'items' : [food]
               });
            }
         }

         // Mood data
         var moods = await connect.pool.query(
            "SELECT *, 'Mood' as type FROM mood WHERE userID = $1 ORDER BY time ASC",
            [userID]
         );
         var moodsJsonRes = JSON.parse(JSON.stringify(moods.rows));

         console.log("Moods: ");
         console.log(moodsJsonRes);

         var inserted = false;
         for (var mood of moodsJsonRes) {
            inserted = false;
            for (let i = 0; i < timeItems.length; i++) {
               if (timeItems[i]['time'] == mood['time'].slice(0, 2)) {
                  timeItems[i]['items'].push(mood);
                  inserted = true;
                  break;
               }
            }
            if (!inserted) {
               timeItems.push({
                  'time' : mood['time'].slice(0, 2),
                  'items' : [mood]
               });
            }
         }

         // Sickness
         var sicknesses = await connect.pool.query(
            "SELECT *, 'Sickness' as type FROM sickness WHERE userID = $1 ORDER BY time ASC",
            [userID]
         );
         var sicknessJsonRes = JSON.parse(JSON.stringify(sicknesses.rows));

         console.log("Sicknesses: ");
         console.log(sicknessJsonRes);

         var inserted = false;
         for (var sickness of sicknessJsonRes) {
            inserted = false;
            for (let i = 0; i < timeItems.length; i++) {
               if (timeItems[i]['time'] == sickness['time'].slice(0, 2)) {
                  timeItems[i]['items'].push(sickness);
                  inserted = true;
                  break;
               }
            }
            if (!inserted) {
               timeItems.push({
                  'time' : sickness['time'].slice(0, 2),
                  'items' : [sickness]
               });
            }
         }

         console.log(timeItems);
         return timeItems;

      }
      catch (error) {
         console.error(error);
      } 
   };
}


module.exports = new itemsModel();