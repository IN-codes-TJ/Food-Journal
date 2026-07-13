const connect = require("../connect");
const express = require('express');

class itemsModel {
   async getTimeItems(userID) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);

         // Redo with a database view, order correctly, and group by date as well as time

         // Get all data (foods, moods and sicknesses), ordered and grouped
         // by time, to the nearest hour
         
         var timeItems = []; // {['time': 'tt:tt', 'items': [items]]}
         var timeDifferenceHours = Math.floor(new Date().getTimezoneOffset()/60);
         var timeDifferenceMinutes = new Date().getTimezoneOffset()%60;

         // Food data
         var foods = await connect.pool.query(
            "SELECT *, 'Food' as type FROM eatenData WHERE userID = $1 ORDER BY time ASC",
            [userID]
         );
         var foodsJsonRes = JSON.parse(JSON.stringify(foods.rows));

         var inserted = false;
         for (var food of foodsJsonRes) {
            inserted = false;
            food['time'] = this.convertTime(food['time'], timeDifferenceHours, timeDifferenceMinutes);
            for (let i = 0; i < timeItems.length; i++) {
               if (timeItems[i]['time'] == food['time']) {
                  timeItems[i]['items'].push(food);
                  inserted = true;
                  break;
               }
            }
            if (!inserted) {
               timeItems.push({
                  'time' : food['time'],
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

         var inserted = false;
         for (var mood of moodsJsonRes) {
            inserted = false;
            mood['time'] = this.convertTime(mood['time'], timeDifferenceHours, timeDifferenceMinutes);
            for (let i = 0; i < timeItems.length; i++) {
               if (timeItems[i]['time'] == mood['time']) {
                  timeItems[i]['items'].push(mood);
                  inserted = true;
                  break;
               }
            }
            if (!inserted) {
               timeItems.push({
                  'time' : mood['time'],
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

         var inserted = false;
         for (var sickness of sicknessJsonRes) {
            inserted = false;
            sickness['time'] = this.convertTime(sickness['time'], timeDifferenceHours, timeDifferenceMinutes);
            for (let i = 0; i < timeItems.length; i++) {
               if (timeItems[i]['time'] == sickness['time']) {
                  timeItems[i]['items'].push(sickness);
                  inserted = true;
                  break;
               }
            }
            if (!inserted) {
               timeItems.push({
                  'time' : sickness['time'],
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

   convertTime(time, hDiff, mDiff) {
      time = time.split("T");
      var newTime = {'date': time[0],
                 'time': {'hours': time[1].slice(0, 2) - hDiff,
                          'minutes': time[1].slice(3, 5) - mDiff
                 }
      };

      return newTime;
   }
}


module.exports = new itemsModel();