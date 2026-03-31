const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const FILE = path.join(__dirname, "messages.json");

// varsa eski mesajları yükle
let messages = [];
if (fs.existsSync(FILE)) {
  messages = JSON.parse(fs.readFileSync(FILE, "utf8"));
}

io.on("connection", (socket) => {
  console.log("Bağlandı");

  socket.emit("chat history", messages);

  socket.on("chat message", (msg) => {
    messages.push(msg);

    // dosyaya kaydet
    fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));

    io.emit("chat message", msg);
  });

  socket.on("delete message", (id) => {
    messages = messages.filter(m => m.id !== id);

    // silince dosyayı güncelle
    fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));

    io.emit("delete message", id);
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, "0.0.0.0", () => {
  console.log("Server çalışıyor");
});
