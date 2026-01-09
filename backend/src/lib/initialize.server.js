import { Server } from "socket.io";
import Conversation from "../models/conversation.model.js";
import Document from "../models/document.model.js";
import Meeting from "../models/meeting.model.js";
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
    // Store document collaborators: { documentId: Map<socketId, { uid, name, color }> }
    const documentCollaborators = new Map();
    // Store meeting participants: { meetingId: Map<socketId, { odatId, userName, photoURL, audioEnabled, videoEnabled }> }
    const meetingParticipants = new Map();

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

        // ============== WORKSPACE SOCKET EVENTS ==============

        // Join workspace room
        socket.on("workspace:join", (workspaceId) => {
            socket.join(`workspace:${workspaceId}`);
            console.log(`User ${userId} joined workspace ${workspaceId}`);
        });

        // Leave workspace room
        socket.on("workspace:leave", (workspaceId) => {
            socket.leave(`workspace:${workspaceId}`);
            console.log(`User ${userId} left workspace ${workspaceId}`);
        });

        // ============== DOCUMENT COLLABORATION EVENTS ==============

        // Join document for collaborative editing
        socket.on("document:join", async ({ documentId, userName }) => {
            socket.join(`document:${documentId}`);

            // Initialize document collaborators map if needed
            if (!documentCollaborators.has(documentId)) {
                documentCollaborators.set(documentId, new Map());
            }

            // Generate random color for cursor
            const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Add collaborator
            documentCollaborators.get(documentId).set(socket.id, {
                uid: userId,
                name: userName || "Anonymous",
                color,
                cursor: 0,
            });

            // Broadcast updated collaborators list
            const collaborators = Array.from(documentCollaborators.get(documentId).values());
            io.to(`document:${documentId}`).emit("document:collaborators", {
                documentId,
                collaborators,
            });

            console.log(`User ${userId} joined document ${documentId}`);
        });

        // Leave document
        socket.on("document:leave", (documentId) => {
            socket.leave(`document:${documentId}`);

            // Remove collaborator
            if (documentCollaborators.has(documentId)) {
                documentCollaborators.get(documentId).delete(socket.id);

                // Broadcast updated collaborators list
                const collaborators = Array.from(documentCollaborators.get(documentId).values());
                io.to(`document:${documentId}`).emit("document:collaborators", {
                    documentId,
                    collaborators,
                });

                // Clean up empty document map
                if (documentCollaborators.get(documentId).size === 0) {
                    documentCollaborators.delete(documentId);
                }
            }

            console.log(`User ${userId} left document ${documentId}`);
        });

        // Broadcast document changes (Yjs updates)
        socket.on("document:update", ({ documentId, update }) => {
            socket.to(`document:${documentId}`).emit("document:update", {
                documentId,
                update,
                senderId: userId,
            });
        });

        // Broadcast cursor position
        socket.on("document:cursor", ({ documentId, cursor, selection }) => {
            if (documentCollaborators.has(documentId)) {
                const collaborator = documentCollaborators.get(documentId).get(socket.id);
                if (collaborator) {
                    collaborator.cursor = cursor;
                }
            }

            socket.to(`document:${documentId}`).emit("document:cursor", {
                documentId,
                userId,
                cursor,
                selection,
            });
        });

        // ============== VIDEO MEETING EVENTS ==============

        // Join meeting room
        socket.on("meeting:join", ({ meetingId, userName, photoURL }) => {
            socket.join(`meeting:${meetingId}`);

            // Initialize meeting participants map if needed
            if (!meetingParticipants.has(meetingId)) {
                meetingParticipants.set(meetingId, new Map());
            }

            // Add participant
            meetingParticipants.get(meetingId).set(socket.id, {
                odatId: userId,
                userName,
                photoURL,
                socketId: socket.id,
                audioEnabled: true,
                videoEnabled: true,
            });

            console.log

            // Send existing participants to the new user
            const existingParticipants = Array.from(meetingParticipants.get(meetingId).values())
                .filter(p => p.socketId !== socket.id);
            socket.emit("meeting:participants", existingParticipants);

            // Notify others that user joined
            socket.to(`meeting:${meetingId}`).emit("meeting:user-joined", {
                meetingId,
                odatId: userId,
                userName,
                photoURL,
                socketId: socket.id,
            });

            console.log(`User ${userId} joined meeting ${meetingId}`);
        });

        // Leave meeting room
        socket.on("meeting:leave", ({ meetingId }) => {
            socket.leave(`meeting:${meetingId}`);

            // Remove participant
            if (meetingParticipants.has(meetingId)) {
                meetingParticipants.get(meetingId).delete(socket.id);

                // Clean up empty meeting map
                if (meetingParticipants.get(meetingId).size === 0) {
                    meetingParticipants.delete(meetingId);
                }
            }

            // Notify others that user left
            socket.to(`meeting:${meetingId}`).emit("meeting:user-left", {
                meetingId,
                odatId: userId,
                socketId: socket.id,
            });

            console.log(`User ${userId} left meeting ${meetingId}`);
        });

        // WebRTC signaling - offer
        socket.on("meeting:offer", ({ meetingId, targetSocketId, offer }) => {
            io.to(targetSocketId).emit("meeting:offer", {
                meetingId,
                fromSocketId: socket.id,
                fromUserId: userId,
                offer,
            });
        });

        // WebRTC signaling - answer
        socket.on("meeting:answer", ({ meetingId, targetSocketId, answer }) => {
            io.to(targetSocketId).emit("meeting:answer", {
                meetingId,
                fromSocketId: socket.id,
                fromUserId: userId,
                answer,
            });
        });

        // WebRTC signaling - ICE candidate
        socket.on("meeting:ice-candidate", ({ meetingId, targetSocketId, candidate }) => {
            io.to(targetSocketId).emit("meeting:ice-candidate", {
                meetingId,
                fromSocketId: socket.id,
                candidate,
            });
        });

        // Toggle audio/video
        socket.on("meeting:toggle-media", ({ meetingId, audioEnabled, videoEnabled }) => {
            // Update participant in map
            if (meetingParticipants.has(meetingId)) {
                const participant = meetingParticipants.get(meetingId).get(socket.id);
                if (participant) {
                    participant.audioEnabled = audioEnabled;
                    participant.videoEnabled = videoEnabled;
                }
            }

            socket.to(`meeting:${meetingId}`).emit("meeting:user-media-toggle", {
                odatId: userId,
                socketId: socket.id,
                audioEnabled,
                videoEnabled,
            });
        });

        // Chat message in meeting
        socket.on("meeting:chat-message", ({ meetingId, message }) => {
            // Broadcast to other participants
            socket.to(`meeting:${meetingId}`).emit("meeting:chat-message", message);
        });

        // End meeting (host only)
        socket.on("meeting:end", async ({ meetingId }) => {
            try {
                // Update meeting status in database
                const meeting = await Meeting.findByIdAndUpdate(
                    meetingId,
                    { status: "completed" },
                    { new: true }
                );

                if (meeting) {
                    // Notify all participants in the meeting room that meeting has ended
                    socket.to(`meeting:${meetingId}`).emit("meeting:ended");

                    // Emit to workspace so meeting lists update
                    io.to(`workspace:${meeting.workspaceId}`).emit("meeting:updated", meeting);

                    console.log(`Meeting ${meetingId} ended and updated to completed status`);
                }

                // Clean up meeting participants
                if (meetingParticipants.has(meetingId)) {
                    meetingParticipants.delete(meetingId);
                }
            } catch (error) {
                console.error(`Failed to end meeting ${meetingId}:`, error);
            }
        });

        // Handle disconnect
        socket.on("disconnect", () => {

            if (userId) {
                connectedUsers.delete(userId);

                // Notify user is offline
                io.emit("user:offline", { userId });

                // Clean up document collaborators
                for (const [documentId, collaborators] of documentCollaborators.entries()) {
                    if (collaborators.has(socket.id)) {
                        collaborators.delete(socket.id);

                        // Broadcast updated collaborators list
                        const remaining = Array.from(collaborators.values());
                        io.to(`document:${documentId}`).emit("document:collaborators", {
                            documentId,
                            collaborators: remaining,
                        });

                        if (collaborators.size === 0) {
                            documentCollaborators.delete(documentId);
                        }
                    }
                }

                // Clean up meeting participants
                for (const [meetingId, participants] of meetingParticipants.entries()) {
                    if (participants.has(socket.id)) {
                        participants.delete(socket.id);

                        // Notify others that user left
                        io.to(`meeting:${meetingId}`).emit("meeting:user-left", {
                            meetingId,
                            odatId: userId,
                            socketId: socket.id,
                        });

                        if (participants.size === 0) {
                            meetingParticipants.delete(meetingId);
                        }
                    }
                }
            }
        });
    });

    // ============== AUTO-UPDATE MEETING STATUS ==============
    // Single function to handle all meeting status transitions
    const updateMeetingStatuses = async () => {
        try {
            const now = new Date();
            const nowTimestamp = now.getTime();

            // Find all active meetings (scheduled or live)
            const meetings = await Meeting.find({
                status: { $in: ["scheduled", "live"] }
            });

            for (const meeting of meetings) {
                const startTimestamp = new Date(meeting.startTime).getTime();
                
                // Calculate end time
                let endTimestamp = null;
                if (meeting.endTime) {
                    endTimestamp = new Date(meeting.endTime).getTime();
                } else if (meeting.duration) {
                    endTimestamp = startTimestamp + (meeting.duration * 60 * 1000);
                }

                // // Debug logging
                // console.log(`\n--- Checking Meeting: "${meeting.title}" (current: ${meeting.status}) ---`);
                // console.log(`  Now:   ${now.toISOString()} (${nowTimestamp})`);
                // console.log(`  Start: ${new Date(meeting.startTime).toISOString()} (${startTimestamp})`);
                // console.log(`  End:   ${endTimestamp ? new Date(endTimestamp).toISOString() : 'none'} (${endTimestamp})`);
                // console.log(`  Duration: ${meeting.duration} minutes`);
                // console.log(`  Conditions: now < start? ${nowTimestamp < startTimestamp}, now >= end? ${endTimestamp ? nowTimestamp >= endTimestamp : 'N/A'}`);

                let newStatus = meeting.status;

                // Determine the correct status based on current time
                if (nowTimestamp < startTimestamp) {
                    // Before start time - should be scheduled
                    newStatus = "scheduled";
                } else if (endTimestamp && nowTimestamp >= endTimestamp) {
                    // After end time - should be completed
                    newStatus = "completed";
                } else if (nowTimestamp >= startTimestamp) {
                    // After start, before end (or no end) - should be live
                    newStatus = "live";
                }


                // Update if status changed
                if (newStatus !== meeting.status) {
                    const oldStatus = meeting.status;
                    meeting.status = newStatus;
                    await meeting.save();

                    // Notify workspace
                    io.to(`workspace:${meeting.workspaceId}`).emit("meeting:updated", meeting);

                    // If meeting ended, notify participants
                    if (newStatus === "completed") {
                        io.to(`meeting:${meeting._id}`).emit("meeting:ended");
                        if (meetingParticipants.has(meeting._id.toString())) {
                            meetingParticipants.delete(meeting._id.toString());
                        }
                    }

                    console.log(`  => STATUS CHANGED: ${oldStatus} → ${newStatus}`);
                }
            }
        } catch (error) {
            console.error("Error updating meeting statuses:", error);
        }
    };

    updateMeetingStatuses();
    setInterval(updateMeetingStatuses, 30 * 1000);

    console.log("Socket.IO server initialized");
    return io;
};
