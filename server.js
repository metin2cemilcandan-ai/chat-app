const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "ikisatir-chat-secret",
  resave: false,
  saveUninitialized: false
}));

function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }
  res.redirect("/login");
}

app.get("/login", (req, res) => {
  res.send(`
    <form method="POST" action="/login" style="text-align:center;margin-top:100px;">
      <h2>İkisatır Giriş</h2>
      <input type="password" name="password" placeholder="Şifre">
      <button type="submit">Giriş</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  if (req.body.password === "123456") {
    req.session.loggedIn = true;
    return res.redirect("/");
  }
  res.send("Şifre yanlış");
});

app.use("/", requireLogin, express.static("public"));

const FILE = path.join(__dirname, "messages.json");

let messages = [];
if (fs.existsSync(FILE)) {
  messages = JSON.parse(fs.readFileSync(FILE, "utf8"));
}

io.on("connection", (socket) => {
  console.log("Bağlandı");

  socket.emit("chat history", messages);

  socket.on("chat message", (msg) => {
    messages.push(msg);
    fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));
    io.emit("chat message", msg);
  });

  socket.on("delete message", (id) => {
    messages = messages.filter(m => m.id !== id);
    fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));
    io.emit("delete message", id);
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, "0.0.0.0", () => {
  console.log("Server çalışıyor");
});
