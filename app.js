// Express: Web application framework for Node.js
const express = require("express");
const app = express();
const path = require("path");
const indexRouter = require("./routes/index");
const chatRouter = require("./routes/chat");
const http = require("http");
const socketIO = require("socket.io");

// Create server instance
const server = http.createServer(app);
const io = socketIO(server);

// Lists to keep track of users and chat rooms
let waitingUsers = [];
let rooms = {};

// Socket.IO event handlers
io.on("connection", function (socket) {
  // When someone wants to chat
  socket.on("joinroom", function () {
    // If someone is already waiting, connect them together
    if (waitingUsers.length > 0) {
      let partner = waitingUsers.shift();
      const roomname = `${socket.id}-${partner.id}`;

      socket.join(roomname);
      partner.join(roomname);

      io.to(roomname).emit("joined", roomname);
    } else {
      // Otherwise, add them to waiting list
      waitingUsers.push(socket);
    }
  });

  // When someone sends a message
  socket.on("message", function (data) {
    // Send the message to the other person in the room
    socket.broadcast.to(data.room).emit("message", data.message);
  });

  // Video call related functions
  // Handle WebRTC signaling messages
  socket.on("signalingMessage", function (data) {
    socket.broadcast.to(data.room).emit("signalingMessage", data.message);
  });

  // Handle video call initialization
  socket.on("startVideoCall", function ({ room }) {
    socket.broadcast.to(room).emit("incomingCall");
  });

  // Handle call acceptance
  socket.on("acceptCall", function ({ room }) {
    socket.broadcast.to(room).emit("callAceepted");
  });

  // Handle call rejection
  socket.on("rejectCall", function ({ room }) {
    socket.broadcast.to(room).emit("callRejected");
  });

  // When someone disconnects
  socket.on("disconnect", function () {
    // Remove them from waiting list if they were waiting
    let index = waitingUsers.findIndex(
      (waitingUsers) => waitingUsers.id === socket.id
    );
    waitingUsers.splice(index, 1);
  });
});

// Express Middleware Configuration
// Set EJS as the template engine for rendering views
app.set("view engine", "ejs");

// Express built-in middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Set up our web pages
app.use("/", indexRouter);
app.use("/chat", chatRouter);

// Start the server on port 3000
server.listen(3000, () => {
  console.log("server is listening at port 3000");
});
