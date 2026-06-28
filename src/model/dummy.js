const connect = require("../connect");
const express = require('express');

class dummyModel {
   async testMethod() {
      const setSchema = "SET search_path TO foodjournal, PUBLIC;"
      await connect.pool.query(setSchema);
      
      var result = await connect.pool.query(
            "SELECT * FROM testtable",
         []
      );

      var jsonRes = JSON.parse(JSON.stringify(result.rows));
      console.log(jsonRes); 
   };
}


module.exports = new dummyModel();