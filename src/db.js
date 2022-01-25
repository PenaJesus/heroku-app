const express = require("express");
let mysql = require("mysql");

let connection = mysql.createPool({
  host : process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  acquireTimeout: 30000,
  port: 3306
});

console.log("DBHOST = ",process.env.DB_HOST);

connection.query("select now()", function(err, rows){
  if(err){
    console.log("Failed to create DB connection", err);
  } else {
    console.log("connected to DB at", rows);
  }
})

module.exports = connection;