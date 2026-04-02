let io;

exports.initSocket = (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: { origin: "*" }
    });

    return io;
};

exports.io = {
    emit: (...args) => io?.emit(...args)
};