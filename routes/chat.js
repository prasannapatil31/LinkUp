const express = require("express");
const chatRouter = express.Router(); // Initialize chatRouter with express.Router()

chatRouter.get("/", function (req, res) {
  res.render("chat"); // Handle the GET request for /chat
});

module.exports = chatRouter; // Export chatRouter
