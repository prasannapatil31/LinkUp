// Express: Web framework for Node.js - required for routing
const express = require("express");

// Create a new router instance
// Router handles all chat-related routes in the application
const chatRouter = express.Router();

// Define route handler for the chat page (GET /chat)
chatRouter.get("/", function (req, res) {
  // Render the chat.ejs view when users access the chat page
  // This will load the chat interface template
  res.render("chat");
});

// Export the router so it can be used in the main app.js file
// This makes the chat routes available to the main application
module.exports = chatRouter;
