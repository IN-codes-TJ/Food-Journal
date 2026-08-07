const connect = require("../connect");
const express = require('express');

class createModel {
   constructor() {
      this.timeDifferenceHours = Math.floor(new Date().getTimezoneOffset()/60);
      this.timeDifferenceMinutes = new Date().getTimezoneOffset()%60;
   }

   async createSickness() {
      try {
        const setSchema = "SET search_path TO foodjournal, PUBLIC;"
        await connect.pool.query(setSchema);
         console.log("running");
        // Add data to database

        var sicknessData = await connect.pool.query(
            "",
            []
        );
        var dataItem = JSON.parse(JSON.stringify(sicknessData.rows))[0];

        return 1;
      }
      catch (error) {
         console.error(error);
         return {'error': true};
      }
   }
}


module.exports = new createModel();