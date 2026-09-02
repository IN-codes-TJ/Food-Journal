const connect = require("../connect");
const express = require('express');
const bcrypt = require('bcrypt');

// TODO: Hashing of passwords

class userModel {
    constructor() {
        this.saltRounds = 10;
    }

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
        
            if (typeof userInfoRes != "undefined") {
                if ((typeof username == "undefined" || username == "") && (typeof password == "undefined" || password == "")) {
                    // Creation/verification from auth using only email
                    return userInfoRes;
                }
                else return {message:"An account with this email already exists."};
            }
            // Insert username and password if provided, otherwise null
           
            if (typeof username == "undefined" || username == "") {
                if (typeof password == "undefined" || password == "") {
                    // Only inserting email
                    userInfo = await connect.pool.query(
                        "INSERT INTO account (email) VALUES($1) RETURNING userID, email, username",
                        [email]
                    );
                    userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
                }
                else {
                    // Inserting email and password
                    password = await this.hash(password);
                    if (password == false) return false;
                    
                    userInfo = await connect.pool.query(
                        "INSERT INTO account (email, password) VALUES($1, $2) RETURNING userID, email, username",
                        [email, password]
                    );
                    userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
                }
            }
            else {
                // Inserting email, password and username (cannot insert a username without a password)
                password = await this.hash(password);
                if (password == false) return false;
                
                userInfo = await connect.pool.query(
                    "INSERT INTO account (email, username, password) VALUES($1, $2, $3) RETURNING userID, email, username",
                    [email, username, password]
                );
                userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];
            }

            return userInfoRes;
        }
        catch (error) {
            console.error(error);
            return {'error': true};
        }
    }

   async hash(password) {
        var salt = bcrypt.genSaltSync(this.saltRounds); // Generate the salt

        if (salt != undefined && salt != false) {
            var hashedPassword = await bcrypt.hashSync(password, salt); // Hash the password
            if (hashedPassword != undefined && hashedPassword != false && hashedPassword != null) {
                // Add to database using the hashed password
                return hashedPassword;
            }
            else return false;
        }
        else return false;
    }

    async login(emailUsername, password) {
        try {
            const setSchema = "SET search_path TO foodjournal, PUBLIC;"
            await connect.pool.query(setSchema);

            var userInfo = await connect.pool.query(
                "SELECT userID, email, username, password FROM account WHERE email = $1 OR username = $1",
                [emailUsername]
            );
            var userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];

            if (typeof userInfoRes == "undefined") {
                return false;
            }
            // An account with this email or username was found

            // Compare passwords
            var bcryptRes = await bcrypt.compare(password, userInfoRes['password']);

            if (bcryptRes == true) { // Correct password
                userInfoRes['password'] = undefined;
                return userInfoRes;
            }

            return false;
        }
        catch (error) {
            console.error(error);
            return {'error': true};
        }
    }

    async getUser(id) {
        try {
            const setSchema = "SET search_path TO foodjournal, PUBLIC;"
            await connect.pool.query(setSchema);

            var userInfo = await connect.pool.query(
                "SELECT email, username FROM account WHERE userid = $1",
                [id]
            );
            var userInfoRes = JSON.parse(JSON.stringify(userInfo.rows))[0];

            return userInfoRes;
        }
        catch (error) {
            console.error(error);
            return {'error': true};
        }
    }
}

module.exports = new userModel();