const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("./utils/users");
const {
    generateMessages,
    generateLocationMessages,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 7000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
    // When a new user connects
    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message", generateMessages("Admin", "Welcome!"));
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                generateMessages(
                    "Admin",
                    `${user.username} has just joined the room`
                )
            );
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        callback();
    });
    // Receive a message and emit message to client
    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessages(user.username, message)
            );
        }
        callback();
    });

    // Receive the location and emit it to other client
    socket.on("sendLocation", (location, callback) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "locationMessage",
                generateLocationMessages(user.username, location)
            );
        }
        callback();
    });

    // Send disconnect message when some user disconnects
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "disconnection",
                generateMessages(user.username, `${user.username} has left`)
            );
        }
    });
});

server.listen(port, () => {
    console.log("Server running on port: ", port);
});
