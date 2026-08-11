const connect = require("../connect");
const express = require('express');

class createModel {
   constructor() {
      this.timeDifferenceHours = Math.floor(new Date().getTimezoneOffset()/60);
      this.timeDifferenceMinutes = new Date().getTimezoneOffset()%60;
   }

   async createmood(userID, name, description, symptoms, associatedFoods) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);
         // Add data to database

         var moodData = await connect.pool.query(
            "INSERT INTO mood(userid, name, description) VALUES($1, $2, $3) RETURNING moodID",
            [userID, name, description]
         );
         var moodID = moodData.rows[0]['moodid'];

         var symptomInsert;
         for (var symptom of symptoms) {
            symptomInsert = await connect.pool.query(
               "INSERT INTO symptom(moodID, symptom) VALUES($1, $2);",
               [moodID, symptom]
            );
         }

         var associatedFoodInsert;
         for (var eatenID of associatedFoods) {
            associatedFoodInsert = await connect.pool.query(
               "INSERT INTO effect(eatenID, causeTypeID, causeType) VALUES($1, $2, 'S');",
               [eatenID, moodID]
            );
         }

         return true;
      }
      catch (error) {
         console.error(error);
         return {'error': true};
      }
   }

   async createMood(userID, name, description, associatedFoods) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);
         // Add data to database

         var moodData = await connect.pool.query(
            "INSERT INTO mood(userid, name, description) VALUES($1, $2, $3) RETURNING moodID",
            [userID, name, description]
         );
         var moodID = moodData.rows[0]['moodid'];

         var associatedFoodInsert;
         for (var eatenID of associatedFoods) {
            associatedFoodInsert = await connect.pool.query(
               "INSERT INTO effect(eatenID, causeTypeID, causeType) VALUES($1, $2, 'M');",
               [eatenID, moodID]
            );
         }

         return true;
      }
      catch (error) {
         console.error(error);
         return {'error': true};
      }
   }
}


module.exports = new createModel();