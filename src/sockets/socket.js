let io;

exports.initSocket = (server) => {
    io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("🔴 Client disconnected:", socket.id);
        });
    });

    return io;
};

exports.getIO = () => {
    if (!io) {
        throw new Error("Socket not initialized!");
    }
    return io;
};