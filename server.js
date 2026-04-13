require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socket");

const { initGeofenceEngine } = require("./src/services/geofenceEngine"); 

const PORT = process.env.PORT || 5000;


connectDB().then(() => {
    console.log("✅ Database Connected Successfully");
    
   
    initGeofenceEngine(); 
});


const server = http.createServer(app);

const io = initSocket(server);


server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});


server.on("error", (err) => {
    console.error("❌ Server Error:", err);
});


process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
});