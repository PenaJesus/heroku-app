const express = require("express");

let router = new express.Router();

let auths = require("./auth");

let controller = require("./controller")

//signup route
router.post("/signup", auths.signup);

//login route
router.post("/login", auths.login)

//list items
router.get("/items", auths.checkJWT, controller.listItems);

//add new item
router.post("/items", auths.checkJWT, controller.addItem);

//get an item by id
router.get("/items/:id", auths.checkJWT, controller.getItem);

//delete an item by id
router.delete("/items/:id", auths.checkJWT, controller.deleteItem);

//update item by id
router.put("/items/:id", auths.checkJWT, controller.updateItem);

module.exports = router;