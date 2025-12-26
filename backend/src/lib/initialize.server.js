import { Server } from "socket.io";
import Conversation from "../models/conversation.model.js";
import { config } from "../config/config.js";

export const initializeServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [config.developmentFrontendURL, config.productionFrontendURL],
            credentials: true,
        },
    });

    // Store connected users
    const connectedUsers = new Map();

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

        // Store user connection
        if (userId) {
            connectedUsers.set(userId, socket.id);

            // Notify user is online
            io.emit("user:online", { userId });

            // Send list of online users to the confirmed user
            const onlineUsers = Array.from(connectedUsers.keys());
            io.to(socket.id).emit("getOnlineUsers", onlineUsers);
            // console.log("Online users:", onlineUsers);
        }

        // Join conversation room
        socket.on("conversation:join", (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });

        // Leave conversation room
        socket.on("conversation:leave", (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        // Handle new message
        socket.on("message:send", async ({ conversationId, message }) => {
            try {

                // Broadcast to conversation room
                socket.to(`conversation:${conversationId}`).emit("message:new", message);

                // Get conversation to find receiver(s)
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    let receiverUids = [];
                    if (conversation.isGroup && conversation.participants) {
                        receiverUids = conversation.participants.filter(p => p !== userId);
                    } else {
                        const receiverUid = conversation.sender === userId ? conversation.receiver : conversation.sender;
                        receiverUids = [receiverUid];
                    }

                    // Notify all receivers
                    receiverUids.forEach(receiverUid => {
                        const receiverSocketId = connectedUsers.get(receiverUid);
                        if (receiverSocketId) {
                            // Update conversation list for receiver (this triggers sidebar update)
                            io.to(receiverSocketId).emit("conversation:update", {
                                conversationId,
                                lastMessage: message,
                                updatedAt: new Date(),
                            });
                        }
                    });
                }
            } catch (error) {
                console.error("Error broadcasting message:", error);
            }
        });

        // Handle typing indicators
        socket.on("typing:start", (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit("typing:start", {
                userId,
                conversationId,
            });
        });

        socket.on("typing:stop", (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit("typing:stop", {
                userId,
                conversationId,
            });
        });

        // Handle read receipts
        socket.on("message:read", async ({ conversationId, messageIds }) => {
            try {
                // Broadcast read receipt
                socket.to(`conversation:${conversationId}`).emit("message:read", {
                    conversationId,
                    messageIds,
                });
            } catch (error) {
                console.error("Error broadcasting read receipt:", error);
            }
        });

        // Handle disconnect
        socket.on("disconnect", () => {

            if (userId) {
                connectedUsers.delete(userId);

                // Notify user is offline
                io.emit("user:offline", { userId });
            }
        });
    });

    console.log("Socket.IO server initialized");
    return io;
};
