// Express: Web framework for Node.js - required for routing functionality
const express = require("express");

// Create a new router instance
// This router will handle all routes for the main/index page
const indexRouter = express.Router();

// Define route handler for the main page (GET /)
indexRouter.get("/", function (req, res) {
  // Render the index.ejs view when users access the homepage
  // This will load the main landing page template
  res.render("index");
});

// Export the router so it can be used in the main app.js file
// This makes the index/main page routes available to the main application
module.exports = indexRouter;



``