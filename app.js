// Required Libraries
// Express: Web framework for creating web applications in Node.js
const express = require("express");
// Create an Express application instance
const app = express();

// Path: Helps work with file and directory paths
const path = require("path");

// Import route handlers for different pages
const indexRouter = require("./routes/index");
const chatRouter = require("./routes/chat");

// HTTP: Node.js built-in library for creating web servers
const http = require("http");

// Socket.IO: Enables real-time bidirectional communication between web clients and server
const socketIO = require("socket.io");

// Create a new HTTP server using Express app
const server = http.createServer(app);
// Initialize Socket.IO with our server
const io = socketIO(server);

// Storage variables
// Array to store users waiting to be matched with chat partners
let waitingUsers = [];
// Object to store active chat rooms
let rooms = {};

// Handle Socket.IO connections
io.on("connection", function (socket) {
  // When a user requests to join a chat room
  socket.on("joinroom", function () {
    // Check if there's someone already waiting to chat
    if (waitingUsers.length > 0) {
      // Get the first waiting user from the queue
      let partner = waitingUsers.shift();
      // Create a unique room name using both users' socket IDs
      const roomname = `${socket.id}-${partner.id}`;

      // Add both users to the room
      socket.join(roomname);
      partner.join(roomname);

      // Notify both users that they've been connected
      io.to(roomname).emit("joined", roomname);
    } else {
      // If no one is waiting, add this user to waiting list
      waitingUsers.push(socket);
    }
  });

  // Handle chat message events
  socket.on("message", function (data) {
    // Forward the message to the other user in the room
    socket.broadcast.to(data.room).emit("message", data.message);
  });

  // Video Chat Feature Handlers

  // Handle WebRTC connection signals between users
  socket.on("signalingMessage", function (data) {
    // Forward connection signals to the other user
    socket.broadcast.to(data.room).emit("signalingMessage", data.message);
  });

  // When a user initiates a video call
  socket.on("startVideoCall", function ({ room }) {
    // Notify the other user about incoming call
    socket.broadcast.to(room).emit("incomingCall");
  });

  // When recipient accepts the video call
  socket.on("acceptCall", function ({ room }) {
    // Notify caller that call was accepted
    socket.broadcast.to(room).emit("callAceepted");
  });

  // When recipient rejects the video call
  socket.on("rejectCall", function ({ room }) {
    // Notify caller that call was rejected
    socket.broadcast.to(room).emit("callRejected");
  });

  // Handle user disconnection
  socket.on("disconnect", function () {
    // Remove disconnected user from waiting list
    let index = waitingUsers.findIndex(
      (waitingUsers) => waitingUsers.id === socket.id
    );
    waitingUsers.splice(index, 1);
  });
});

// Express App Configuration

// Set EJS (Embedded JavaScript) as the view engine
// EJS allows us to generate HTML with plain JavaScript
app.set("view engine", "ejs");

// Middleware Setup
// Enable parsing of JSON data in requests
app.use(express.json());
// Enable parsing of URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));
// Serve static files (images, CSS, JavaScript) from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Route Setup
// Handle main page routes
app.use("/", indexRouter);
// Handle chat-related routes
app.use("/chat", chatRouter);

// Start the server
server.listen(3000, () => {
  console.log("server is listening at port 3000");
});
