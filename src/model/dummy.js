const connect = require("../connect");
const express = require('express');

class itemsModel {
   async getTimeItems(userID) {
      try {
         const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);
         
         var result = await connect.pool.query(
               "SELECT * FROM eatenFood ORDER BY timeEaten ASC",
            []
         );
         // Don't forget ingredients
         var jsonRes = JSON.parse(JSON.stringify(result.rows));
         console.log(jsonRes);
      }
      catch (error) {
         console.error(error);
      } 
   };
}


module.exports = new dummyModel();