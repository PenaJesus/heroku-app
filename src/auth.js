// this is authentication 
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
let db = require("./db");
let jwtSecret = process.env.JWT_SECRET;

const { param } = require("express/lib/request");

//this function should check if the request has a valid JWT Token
let checkJWT = function (req, res, next) {
  //get the token from the header
  let authHeader = req.headers.authorization;

  let signedToken;
  if(authHeader){
    let parts = authHeader.split(" ");
    signedToken = parts[1];
  } else {
    signedToken = null;
  }
  
  if(!signedToken){
    res.send(401).status("Unauthorized")
  }
  
  //if the token is valid, call next, otherwise return 401
  if(signedToken){
    jwt.verify(signedToken, jwtSecret, function(err, token){
      if(err){
        console.log("Could not verify jwt Token ", err);
      } else {
        req.jwtToken = token;
        next();
      }
    })
  }
}

//this function uses info in request to add new user to DB
let signup = function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  //check that username was passed in
  if (!username) {
    res.status(400).send("Username required");
    return;
  }

  //check that password was passed in
  if (!password) {
    res.status(400).send("Password required");
    return;
  }

  //hash password
  let hash = bcrypt.hashSync(password, 10);

  //store the username and HASH in the DB
  let sql = "insert into users(username, password) values (?, ?); "
  let params = [username, hash];

  db.query(sql, params, function (err, rows) {
    if (err) {
      console.log("Could not create user", err);
      res.status(500).send("Could not create user");
    } else {
      res.status(200).send("user created")
    }
  })
}

//this function checks the username and password from the request and returns a valid JWT Token if the username and password are good

let login = function (req, res) {
  //get username and password from request
  let username = req.body.username;
  let password = req.body.password;

  // get the password hash from the username in the DB
  let sql = "select username, password from users where username = ?";
  let params = [username];

  let goodPassword = false;

  db.query(sql, params, function (err, rows) {
    if (err) {
      console.error("Could not login user", err);
    } else if (rows.length > 1) {
      console.error("Got more than one row for username ", username);
    } else if (rows.length == 0) {
      console.error("Could not find user for ", username);
    } else {
      //compare the hashs to the password passed in
      let storedHash = rows[0].password;
      let goodPassword = bcrypt.compareSync(password, storedHash);
    }

    if(goodPassword){
      //generate a token, sign it, and return it
      let token = {
        "username": username
      };

      let signedToken = jwt.sign(token, jwtSecret);
      res.json(signedToken);
    } else {
      res.status(401).send("Unauthorized")
    }

  })
  
}

module.exports = {
  checkJWT, login, signup
}