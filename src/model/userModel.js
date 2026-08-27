const connect = require("../connect");
const express = require('express');

// TODO: Hashing of passwords

class userModel {
   async createUser(email, username, password) {
      try {
        const setSchema = "SET search_path TO foodjournal, PUBLIC;"
        await connect.pool.query(setSchema);

        var userInfo;
        var userInfoRes;

        // Check if in database already:
        userInfo = await connect.pool.query(
            "SELECT userID, email, username FROM account WHERE email = $1",
            [email]
        );
        userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
        
        if (typeof userInfoRes != "undefined") return userInfoRes;
        // Insert username and password if provided, otherwise null
        console.log("adding to database");

        if (typeof username == "undefined") {
            if (typeof password == "undefined") {
                // Only inserting email
                userInfo = await connect.pool.query(
                    "INSERT INTO account (email) VALUES($1) RETURNING userID, email, username",
                    [email]
                );
                userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
            }
            else {
                // Inserting email and password
                userInfo = await connect.pool.query(
                    "INSERT INTO account (email, password) VALUES($1) RETURNING userID, email, username",
                    [email, password]
                );
                userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
            }
        }
        else {
            // Inserting username
            if (typeof password == "undefined") {
                // Inserting username and email, no password
                userInfo = await connect.pool.query(
                    "INSERT INTO account (email, username) VALUES($1) RETURNING userID, email, username",
                    [email, username]
                );
                userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
            }
            else {
                // Inserting email, password and username
                userInfo = await connect.pool.query(
                    "INSERT INTO account (email, username, password) VALUES($1) RETURNING userID, email, username",
                    [email, username, password]
                );
                userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
            }
        }

        return userInfoRes;
      }
      catch (error) {
        console.error(error);
        return {'error': true};
      }
   }
}

module.exports = new userModel();