const connect = require("../connect");
const express = require('express');

class dummyModel {
   async testMethod() {
      try {
         /*const setSchema = "SET search_path TO foodjournal, PUBLIC;"
         await connect.pool.query(setSchema);
         
         var result = await connect.pool.query(
               "SELECT * FROM foodData",
            []
         );

         var jsonRes = JSON.parse(JSON.stringify(result.rows));
         console.log(jsonRes);*/
      }
      catch (error) {
         console.error(error);
      } 
   };
}


module.exports = new dummyModel();