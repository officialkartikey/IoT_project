require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socket");

const PORT = process.env.PORT || 5000;

// 🔥 DB CONNECT FIRST
connectDB();

// 🔥 CREATE HTTP SERVER
const server = http.createServer(app);

// 🔥 INIT SOCKET (IMPORTANT)
initSocket(server);

// 🔥 START SERVER
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// 🔥 HANDLE ERRORS (VERY IMPORTANT FOR PRODUCTION)
server.on("error", (err) => {
    console.error("❌ Server Error:", err);
});

// 🔥 OPTIONAL: HANDLE UNCAUGHT ERRORS
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
});