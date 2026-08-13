const connect = require("../connect");
const express = require('express');

class createModel {
   constructor() {
      this.timeDifferenceHours = Math.floor(new Date().getTimezoneOffset()/60);
      this.timeDifferenceMinutes = new Date().getTimezoneOffset()%60;
   }

   async createSickness(userID, name, description, symptoms, associatedFoods) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);
         // Add data to database

         var sicknessData = await connect.pool.query(
            "INSERT INTO sickness(userid, name, description) VALUES($1, $2, $3) RETURNING sicknessID",
            [userID, name, description]
         );
         var sicknessID = sicknessData.rows[0]['sicknessid'];

         var symptomInsert;
         for (var symptom of symptoms) {
            symptomInsert = await connect.pool.query(
               "INSERT INTO symptom(sicknessID, symptom) VALUES($1, $2);",
               [sicknessID, symptom]
            );
         }

         var associatedFoodInsert;
         for (var eatenID of associatedFoods) {
            associatedFoodInsert = await connect.pool.query(
               "INSERT INTO effect(eatenID, causeTypeID, causeType) VALUES($1, $2, 'S');",
               [eatenID, sicknessID]
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

   async createFood(userID, name, description, ingredients) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);
         // Add data to database

         var foodData = await connect.pool.query(
            "INSERT INTO foodData(userid, name, description) VALUES($1, $2, $3) RETURNING foodID",
            [userID, name, description]
         );
         var foodID = foodData.rows[0]['foodid'];

         var ingredientInsert;
         for (var ingredient of ingredients) {
            ingredientInsert = await connect.pool.query(
               "INSERT INTO ingredient(foodID, name) VALUES($1, $2);",
               [foodID, ingredient]
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