const connect = require("../connect");
const express = require('express');

class itemsModel {
   constructor() {
      this.timeDifferenceHours = Math.floor(new Date().getTimezoneOffset()/60);
      this.timeDifferenceMinutes = new Date().getTimezoneOffset()%60;
   }

   prepareItem(item) {
      try {
         var splitTime = item['time'].split("T");
   
         item['time'] = [splitTime[1].slice(0, 2) - this.timeDifferenceHours,
                     splitTime[1].slice(3, 5) - this.timeDifferenceMinutes] // Split into hours [0] and minutes [1]

         return item;
      }
      catch (error) {
         console.error(error);
      }
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
         
         if (typeof dataItem == 'undefined') throw new Error('Invalid eatenID');

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
         return {'error': true};
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
         if (typeof dataItem == 'undefined') throw new Error('Invalid moodID');

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
         return {'error': true};
      }
   }

   async getSicknessItem(sicknessID) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);

         // Get data about this sickness item

         var sicknessData = await connect.pool.query(
            "SELECT * FROM sickness WHERE sicknessID = $1;",
            [sicknessID]
         );
         var dataItem = JSON.parse(JSON.stringify(sicknessData.rows))[0];
         if (typeof dataItem == 'undefined') throw new Error('Invalid sicknessID');

         dataItem = this.prepareItem(dataItem);

         // TODO: Get associated symptoms of this food
         var symptomsData = await connect.pool.query(
            "SELECT * FROM symptom WHERE sicknessID = $1",
            [sicknessID]
         );
         var symptomsJsonRes = JSON.parse(JSON.stringify(symptomsData.rows));
         
         // Get associated foods that resulted in this sickness

         var associationsData = await connect.pool.query(
            "SELECT * FROM eatenData WHERE eatenID = (SELECT eatenID FROM effect WHERE causeTypeID = $1 AND causeType = 'S' LIMIT 1);",
            [sicknessID]
         );
         var associationsJsonRes = JSON.parse(JSON.stringify(associationsData.rows));
         
         return {'sicknessData': dataItem, 'symptoms': symptomsJsonRes, 'associations': associationsJsonRes};
      }
      catch (error) {
         console.error(error);
         return {'error': true};
      }
   }
}


module.exports = new itemsModel();