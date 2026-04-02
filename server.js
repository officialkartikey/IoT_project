require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socket");

connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(process.env.PORT, () => {
    console.log("Server running...");
});