import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server (server, {
    cors: {
        origin: ["http://localhost:5173"]
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const socketUserMap = {};
const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        socketUserMap[socket.id] = userId;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        const disconnectedUserId = socketUserMap[socket.id];
        delete userSocketMap[disconnectedUserId];
        delete socketUserMap[socket.id];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };