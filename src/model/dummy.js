const connect = require("../connect");
const express = require('express');

class dummyModel {
   async testMethod() {
      var result = await connect.pool.query(
            "SELECT * FROM testtable",
         []
      );

      var jsonRes = JSON.parse(JSON.stringify(result.rows));
      console.log(jsonRes); 
   };
}


module.exports = new dummyModel();