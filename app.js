const express = require("express");
const app = express();
const path = require("path");
const indexRouter = require("./routes/index");
const chatRouter = require("./routes/chat");

const http = require("http");
const socketIO = require("socket.io");
const { Console } = require("console");
const server = http.createServer(app);
const io = socketIO(server);



let waitingUsers = [];
let rooms = {};

io.on("connection", function (socket) {
  socket.on("joinroom", function () {
    if (waitingUsers.length > 0) {
      let partner = waitingUsers.shift();
      const roomname = `${socket.id}-${partner.id}`;

      socket.join(roomname);
      partner.join(roomname);

      io.to(roomname).emit("joined", roomname);
    } else {
      waitingUsers.push(socket);
    }
  });

  

  // When a client sends a message
  socket.on("message", function (data) {
    //console.log(`Server received message: ${data.message} for room: ${data.room}`);

    // Emit the message to all clients in the specified room
    //io.to(data.room).emit("message", data.message);
    // To exclude the sender, use:
    socket.broadcast.to(data.room).emit("message", data.message);
  });

  socket.on("signalingMessage", function (data) {
    socket.broadcast.to(data.room).emit("signalingMessage", data.message);
  });
  socket.on("startVideoCall", function ({ room }) {
    socket.broadcast.to(room).emit("incomingCall");
  });

  socket.on("acceptCall", function ({ room }) {
    socket.broadcast.to(room).emit("callAceepted");
  });

  socket.on("rejectCall", function ({ room }) {
    socket.broadcast.to(room).emit("callRejected");
  });

  socket.on("disconnect", function () {
    let index = waitingUsers.findIndex(
      (waitingUsers) => waitingUsers.id === socket.id
    );
    waitingUsers.splice(index, 1);
  });
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// app.set('views', path.join(__dirname, 'views'));

app.use("/", indexRouter);

app.use("/chat", chatRouter);

// app.get('/chat', (req, res) => {
//     res.render('chat'); // This renders the chat.ejs file
//   });

server.listen(3000 , ()=>{
  console.log("server is listening at port 3000")
});