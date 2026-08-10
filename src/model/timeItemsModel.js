const connect = require("../connect");
const express = require('express');

class itemsModel {
   constructor() {
      this.timeDifferenceHours = Math.floor(new Date().getTimezoneOffset()/60);
      this.timeDifferenceMinutes = new Date().getTimezoneOffset()%60;
   }

   async getTimeItems(userID) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);

         // Get all data (foods, moods and sicknesses), ordered and grouped
         // by time, to the nearest hour
         

         var itemsList = await connect.pool.query(
            "SELECT * FROM itemsList WHERE userID = $1;",
            [userID]
         );
         var itemsJsonRes = JSON.parse(JSON.stringify(itemsList.rows));
         
         if (itemsJsonRes.length == 0) return itemsJsonRes;
         
         var separatedTime = itemsJsonRes[0]['time'].split("T");
         var preparedItem = this.prepareItem(itemsJsonRes[0], separatedTime);
         var groupedList = [{
            'date': separatedTime[0],
            'times': [{
               'time': preparedItem['time']['time'][0],
               'items': [preparedItem]
            }]
         }];

         // Already ordered by view, so don't need to worry about re-ordering
         var groupedPointer = 0;
         var groupedTimePointer = 0;
         for (let i = 1; i < itemsJsonRes.length; i++) {
            separatedTime = itemsJsonRes[i]['time'].split("T");
            preparedItem = this.prepareItem(itemsJsonRes[i], separatedTime);
            console.log(preparedItem);
            console.log("prep")
            if (separatedTime[0] == groupedList[groupedPointer]['date']) {
               // Same date, so add to this date group
               // First, check if there's already an associated time
               console.log(groupedList[groupedPointer]['times'][groupedTimePointer])
               if (groupedList[groupedPointer]['times'][groupedTimePointer]['time'] == preparedItem['time']['time'][0]) {
                  // There is an associated time, so add to this group
                  groupedList[groupedPointer]['times'][groupedTimePointer]['items'].push(preparedItem);
               }
               else {
                  // There is not an associated time, so add to a new group
                  groupedList[groupedPointer]['times'].push({
                     'time': preparedItem['time']['time'][0],
                     'items': [preparedItem]
                  });
                  groupedTimePointer++;
               }
            }
            else {
               // Different date not already added, so create new date group and add to this
               groupedList.push({
                  'date': separatedTime[0],
                  'times': [{
                     'time': preparedItem['time']['time'][0],
                     'items': [preparedItem]
                  }]
               });
               groupedPointer++;
               groupedTimePointer = 0;
            }
         }
         return groupedList;

      }
      catch (error) {
         console.error(error);
      } 
   };

   prepareItem(item, splitTime) {
      item['time'] = {
         'date': splitTime[0],
         'time': [splitTime[1].slice(0, 2) - this.timeDifferenceHours,
                  splitTime[1].slice(3, 5) - this.timeDifferenceMinutes] // Split into hours [0] and minutes [1]
      };

      return item;
   }
}


module.exports = new itemsModel();