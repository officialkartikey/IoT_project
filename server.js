require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socket");
// Import the geofence engine (we will create this next)
const { initGeofenceEngine } = require("./src/services/geofenceEngine"); 

const PORT = process.env.PORT || 5000;

// 🔥 DB CONNECT FIRST
connectDB().then(() => {
    console.log("✅ Database Connected Successfully");
    
    // 🔥 INIT GEOFENCE ENGINE 
    // This starts listening to MQTT and checking the DB for the active fence
    initGeofenceEngine(); 
});

// 🔥 CREATE HTTP SERVER
const server = http.createServer(app);

// 🔥 INIT SOCKET (IMPORTANT)
// We pass the server to socket.io so the frontend gets real-time alerts
const io = initSocket(server);

// 🔥 START SERVER
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// 🔥 HANDLE ERRORS
server.on("error", (err) => {
    console.error("❌ Server Error:", err);
});

// 🔥 UNCAUGHT ERRORS
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
});