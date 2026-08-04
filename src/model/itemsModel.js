const connect = require("../connect");
const express = require('express');

class itemsModel {
   constructor() {
      this.timeDifferenceHours = Math.floor(new Date().getTimezoneOffset()/60);
      this.timeDifferenceMinutes = new Date().getTimezoneOffset()%60;
   }

   prepareItem(item) {
      var splitTime = item['time'].split("T");
 
      item['time'] = [splitTime[1].slice(0, 2) - this.timeDifferenceHours,
                  splitTime[1].slice(3, 5) - this.timeDifferenceMinutes] // Split into hours [0] and minutes [1]

      return item;
   }

   async getFoodItem(eatenID) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);

         // Get data about this food item

         var foodData = await connect.pool.query(
            "SELECT * FROM eatenData WHERE eatenID = $1;",
            [eatenID]
         );
         var dataItem = JSON.parse(JSON.stringify(foodData.rows))[0];

         dataItem = this.prepareItem(dataItem);

         var ingredients = await connect.pool.query(
            "SELECT * FROM ingredient WHERE foodID = $1",
            [dataItem['foodid']]
         );
         var ingredientsJsonRes = JSON.parse(JSON.stringify(ingredients.rows));

         var alteredIngredients = await connect.pool.query(
               "SELECT * FROM modification WHERE eatenID = $1",
               [eatenID]
         );
         var alteredJsonRes = JSON.parse(JSON.stringify(alteredIngredients.rows));

         var finalIngredients = [];
         var modified = false;
         for (var ingredient of ingredientsJsonRes) {
            modified = false;
            for (var alteration of alteredJsonRes) {
               if (alteration['alteredingredientid'] == ingredient['ingredientid']) {
                  ingredient['name'] = alteration['newingredient'];
                  modified = true;
               }
               break;
            }
            ingredient['modified'] = modified;
            finalIngredients.push(ingredient);
         }

         var effects = await connect.pool.query(
            "SELECT * FROM effect WHERE eatenID = $1",
            [eatenID]
         );
         var effectsJsonRes = JSON.parse(JSON.stringify(effects.rows));
         
         var effectData;
         var effectsData = [];
         var query;
         for (var effect of effectsJsonRes) {
            if (effect['causetype'] == 'M') {
               query = "SELECT * FROM mood WHERE moodID = $1";
            }
            else {
               query = "SELECT * FROM sickness WHERE sicknessID = $1";
            }

            effectData = await connect.pool.query(
               query,
               [effect['causetypeid']]
            );

            effectsData.push(JSON.parse(JSON.stringify(effectData.rows))[0]);
         }

         return {'foodData': dataItem, 'ingredients': finalIngredients, 'effects': effectsData};
      }
      catch (error) {
         console.error(error);
      }
   }

   async getMoodItem(moodID) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);

         // Get data about this mood item

         var moodData = await connect.pool.query(
            "SELECT * FROM mood WHERE moodID = $1;",
            [moodID]
         );
         var dataItem = JSON.parse(JSON.stringify(moodData.rows))[0];

         dataItem = this.prepareItem(dataItem);

         // Get associated foods that resulted in this mood

         var associationsData = await connect.pool.query(
            "SELECT * FROM eatenData WHERE eatenID = (SELECT eatenID FROM effect WHERE causeTypeID = $1 AND causeType = 'M' LIMIT 1);",
            [moodID]
         );
         var associationsJsonRes = JSON.parse(JSON.stringify(associationsData.rows));
         
         return {'moodData': dataItem, 'associations': associationsJsonRes};
      }
      catch (error) {
         console.error(error);
      }
   }
}


module.exports = new itemsModel();