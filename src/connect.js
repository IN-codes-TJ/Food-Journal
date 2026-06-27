require('dotenv').config();

const {Pool} = require("pg");

class Connect {
    constructor() {
        console.log("connection called");

        //Setup variables
        this.pool = new Pool({
            host: process.env.SERVER_HOST,
            port: Number(process.env.SERVER_PORT),
            database: process.env.DATABASE_NAME,
            user: process.env.SERVER_USER,
            password: process.env.SERVER_PASSWORD
        })

        //display console messages for testing
        this.isConnected = null;
        this.connectionError = "Server is establishing a database connection, please wait.";

        this.tryToConnect();
    }

    //use environment variables to try and connect to the database
    async tryToConnect() {
        try {
            const connection = await this.pool.connect()
            const setSchema = "SET search_path TO " + process.env.SCHEMA_NAME + ", PUBLIC;";
            await this.pool.query(setSchema);
            
            console.log("Database connection established.");
            this.isConnected = true;
        } catch (err) {
            //return error
            console.error("Database connection could not be established.", err);
            this.isConnected = false;
            if (err.code == "ETIMEDOUT") this.connectionError = "Database is unavailable, please try again later."
            else this.connectionError = err.code;
        }
    }

    //get the status of the DB connection
    getStatus() {
    return {
        connected: this.isConnected, 
        errorMsg: this.connectionError
    };
  }

}

const connect = new Connect();
module.exports = connect;