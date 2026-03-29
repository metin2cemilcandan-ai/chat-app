const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let messages = [];

io.on("connection", (socket) => {
    console.log("Bağlandı");

    socket.emit("chat history", messages);

    socket.on("chat message", (msg) => {
        messages.push(msg);
        io.emit("chat message", msg);
    });
});

http.listen(3000, "0.0.0.0", () => {
    console.log("Server çalışıyor");
});
