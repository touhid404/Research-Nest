import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import User from "../../models/user.model.js";
import { encrypt, decrypt } from "../../utils/encryption.js";
import { createWorkspaceService } from "../workspace/services/workspace.service.js"; // Import workspace service

// Helper function to get user details by uid
const getUsersByUids = async (uids) => {
    return await User.find({
        $or: uids.map(uid => ({ uid }))
    }).select("name email photoURL uid _id");
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "User ID is required in headers",
            });
        }

        // Find conversations where user is either sender or receiver
        // Find conversations where user is either sender or receiver OR in participants
        // Find conversations where user is involved AND has not deleted the conversation
        // For groups: Must be in participants (ignore sender/receiver fields which might be creator)
        // For 1-on-1: Sender or Receiver
        const conversations = await Conversation.find({
            $and: [
                {
                    $or: [
                        // 1-on-1 logic: Sender or Receiver, AND isGroup is false/undefined
                        {
                            $and: [
                                { $or: [{ sender: uid }, { receiver: uid }] },
                                { $or: [{ isGroup: false }, { isGroup: { $exists: false } }] }
                            ]
                        },
                        // Group logic: Must be in participants
                        {
                            $and: [
                                { isGroup: true },
                                { participants: { $in: [uid] } }
                            ]
                        }
                    ]
                },
                // Exclude if user deleted it
                { deletedBy: { $ne: uid } }
            ]
        })
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        // Get all unique user UIDs from sender, receiver AND participants
        const userUids = [...new Set(conversations.flatMap(c => [
            c.sender,
            c.receiver,
            ...(c.participants || [])
        ]))].filter(uid => uid);
        const users = await getUsersByUids(userUids);
        const userMap = new Map(users.map(u => [u.uid, u]));

        // Format response with participant details
        // Format response with participant details
        const formattedConversations = conversations.map((conv) => {
            // Logic for 1-on-1: existing logic
            // Logic for group: otherUser is null or we provide group info

            // For 1-on-1, determine "otherUser"
            let otherUserUid = null;
            if (!conv.isGroup) {
                otherUserUid = conv.sender === uid ? conv.receiver : conv.sender;
            }

            return {
                _id: conv._id,
                isGroup: conv.isGroup,
                groupName: conv.groupName,
                groupAdmin: conv.groupAdmin, // Return admin ID
                participants: (conv.participants || []).map(pId => userMap.get(pId) || { uid: pId }), // Populate participants
                sender: userMap.get(conv.sender) || (conv.sender ? { uid: conv.sender } : null),
                receiver: userMap.get(conv.receiver) || (conv.receiver ? { uid: conv.receiver } : null),
                otherUser: otherUserUid ? (userMap.get(otherUserUid) || { uid: otherUserUid }) : null,
                lastMessage: conv.lastMessage ? {
                    ...conv.lastMessage.toObject(),
                    text: decrypt(conv.lastMessage.text)
                } : null,
                unreadCount: conv.unreadCount.get(uid.toString()) || 0,
                updatedAt: conv.updatedAt,
            };
        });

        res.status(200).json({
            success: true,
            data: formattedConversations,
        });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch conversations",
            error: error.message,
        });
    }
};

// Get or create conversation with another user
export const getOrCreateConversation = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { otherUserId } = req.body;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "User ID is required in headers",
            });
        }

        if (!otherUserId) {
            return res.status(400).json({
                success: false,
                message: "Other user ID is required",
            });
        }

        // Find existing conversation (check both directions)
        // Find existing conversation (check both directions), ensuring it is NOT a group
        // legacy documents might not have isGroup field, so check if it is false OR doesn't exist
        let conversation = await Conversation.findOne({
            $and: [
                {
                    $or: [
                        { isGroup: false },
                        { isGroup: { $exists: false } }
                    ]
                },
                {
                    $or: [
                        { sender: uid, receiver: otherUserId },
                        { sender: otherUserId, receiver: uid }
                    ]
                }
            ]
        }).populate("lastMessage");

        // Create new conversation if doesn't exist
        if (!conversation) {
            conversation = new Conversation({
                sender: uid,
                receiver: otherUserId,
                participants: [uid, otherUserId] // Standardize with groups
            });
            await conversation.save();
        } else if (!conversation.participants || conversation.participants.length === 0) {
            // Fix legacy conversations missing participants
            conversation.participants = [conversation.sender, conversation.receiver].filter(id => id);
            await conversation.save();
        }

        // Fetch user details
        const users = await getUsersByUids([uid, otherUserId]);
        const userMap = new Map(users.map(u => [u.uid, u]));

        res.status(200).json({
            success: true,
            data: {
                ...conversation.toObject(),
                lastMessage: conversation.lastMessage ? {
                    ...conversation.lastMessage.toObject(),
                    text: decrypt(conversation.lastMessage.text)
                } : null,
                sender: userMap.get(conversation.sender) || { uid: conversation.sender },
                receiver: userMap.get(conversation.receiver) || { uid: conversation.receiver },
                otherUser: userMap.get(otherUserId) || { uid: otherUserId },
            },
        });
    } catch (error) {
        console.error("Error getting/creating conversation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get/create conversation",
            error: error.message,
        });
    }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "User ID is required in headers",
            });
        }

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        // Check if user is sender or receiver
        // Check if user is sender or receiver OR participant
        const isParticipant = (conversation.participants && conversation.participants.includes(uid)) ||
            conversation.sender === uid ||
            conversation.receiver === uid;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation",
            });
        }

        // Build query
        const query = { conversationId: conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get sender details
        const senderUids = [...new Set(messages.map(m => m.sender))];
        const senders = await getUsersByUids(senderUids);
        const senderMap = new Map(senders.map(s => [s.uid, s]));

        // Add sender details to messages
        const messagesWithSenders = messages.map(msg => ({
            ...msg.toObject(),
            text: decrypt(msg.text),
            senderDetails: senderMap.get(msg.sender) || { uid: msg.sender },
        }));

        res.status(200).json({
            success: true,
            data: messagesWithSenders.reverse(), // Return in chronological order
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
            error: error.message,
        });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { conversationId, text, attachment } = req.body;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "User ID is required in headers",
            });
        }

        if (!conversationId || (!text && !attachment)) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID and message content are required",
            });
        }

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        // Check if user is sender or receiver
        // Check if user is participant
        const isParticipant = (conversation.participants && conversation.participants.includes(uid)) ||
            conversation.sender === uid ||
            conversation.receiver === uid;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation",
            });
        }

        // Determine receivers
        let receivers = [];
        if (conversation.isGroup) {
            receivers = conversation.participants.filter(p => p !== uid);
        } else {
            const singleReceiver = conversation.sender === uid ? conversation.receiver : conversation.sender;
            receivers = [singleReceiver];
        }

        // Create message
        const message = new Message({
            conversationId: conversationId,
            sender: uid,
            receiver: conversation.isGroup ? null : receivers[0], // For group, receiver is null or handled differently
            text: encrypt(text) || "",
            attachment: attachment || null,
        });

        // Revive conversation if it was deleted by any participant
        if (conversation.deletedBy && conversation.deletedBy.length > 0) {
            conversation.deletedBy = []; // Clear deletedBy array to show to everyone again
            // Or specifically remove receivers? Usually a new message brings it back for everyone.
        }

        await message.save();

        // Get sender details
        const sender = await User.findOne({ uid }).select("name email photoURL uid");

        // Update conversation
        conversation.lastMessage = message._id;

        // Increment unread count for receivers
        receivers.forEach(receiverId => {
            const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
            conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
        });
        conversation.markModified("unreadCount");

        await conversation.save();

        res.status(201).json({
            success: true,
            data: {
                ...message.toObject(),
                text: text, // Return original text to sender, no need to decrypt what we just encrypted
                senderDetails: sender || { uid },
            },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
            error: error.message,
        });
    }
};


// Delete a message
export const deleteMessage = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { messageId } = req.params;

        if (!uid) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only sender can delete their message (or maybe receiver too? usually sender)
        // Let's allow sender to delete for everyone, or maybe just for themselves?
        // Requirement: "delete single message... should delete message of this conversations" implies deletion for everyone or at least DB removal.
        if (message.sender !== uid) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        const conversationId = message.conversationId;
        await Message.findByIdAndDelete(messageId);

        // Update lastMessage if this was the last message
        const conversation = await Conversation.findById(conversationId);
        if (conversation.lastMessage?.toString() === messageId) {
            const newLastMessage = await Message.findOne({ conversationId }).sort({ createdAt: -1 });
            conversation.lastMessage = newLastMessage ? newLastMessage._id : null;
            await conversation.save();
        }

        // Emit socket event (handled by frontend to remove from UI)
        // This requires access to io structure or we just rely on clients reloading/refetching?
        // Ideally we emit an event. But controller doesn't have direct access to io unless we pass it or import it.
        // For now, client will remove it optimistically or we rely on re-fetch.
        // Better: The client that triggers delete can emit "message:delete" via socket to other party.

        res.status(200).json({ success: true, message: "Message deleted" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: "Failed to delete message", error: error.message });
    }
};

export const createGroupConversation = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { participantIds, groupName, createWorkspace } = req.body;

        if (!uid) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return res.status(400).json({ message: "Participants are required" });
        }

        if (!groupName) {
            return res.status(400).json({ message: "Group name is required" });
        }

        // Add creator to participants if not already there
        const allParticipants = [...new Set([...participantIds, uid])];

        const newConversation = new Conversation({
            isGroup: true,
            groupName,
            groupAdmin: uid,
            participants: allParticipants,
            // sender/receiver can be left empty or set to creator for reference, but we rely on participants
            sender: uid, // Optional: keep sender as creator
        });

        await newConversation.save();

        // Optionally create workspace
        let workspace = null;
        if (createWorkspace) {
            try {
                workspace = await createWorkspaceService({
                    uid,
                    name: groupName,
                    description: `Workspace for ${groupName}`,
                    memberUids: participantIds, // service handles adding owner
                    conversationId: newConversation._id,
                });
            } catch (wsError) {
                console.error("Failed to create workspace with group:", wsError);
                // We don't fail the group creation, but maybe we should warn? 
                // For now, let's proceed but maybe include a warning in response?
                // The requirements said "if user want... it should create". 
                // Any created workspace will be returned.
            }
        }

        // Fetch user details for response
        const users = await getUsersByUids(allParticipants);
        const userMap = new Map(users.map(u => [u.uid, u]));

        res.status(201).json({
            success: true,
            data: {
                ...newConversation.toObject(),
                participants: allParticipants.map(uid => userMap.get(uid) || { uid }),
                workspace: workspace // Return workspace info if created
            }
        });

        // Emit socket event to all participants
        const io = req.app.get("io");
        if (io) {
            allParticipants.forEach(participantId => {
                // Determine if we should send full object or just trigger fetch
                // Frontend logic: listens for "conversation:update", if not found -> fetches all.
                // sending minimal payload triggers the desired fetch.
                io.to(`user:${participantId}`).emit("conversation:update", {
                    conversationId: newConversation._id,
                    lastMessage: null,
                    updatedAt: newConversation.updatedAt,
                    // We can also send full conversation if we change frontend to accept it:
                    // conversation: formattedConversation 
                });
            });
        }

    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Failed to create group", error: error.message });
    }
};

// Delete a conversation
export const deleteConversation = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { conversationId } = req.params;

        if (!uid) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.isGroup) {
            if (conversation.sender !== uid && conversation.receiver !== uid) {
                return res.status(403).json({ message: "Not authorized to delete this conversation" });
            }
        }

        // GROUP: Only admin can delete entirely (Already enforced? User said "make this simple", maybe allow anyone? No, user implied "when a user delete... it delete from both side". For 1-v-1 anyone can. For Group, probably still admin.)
        if (conversation.isGroup && conversation.groupAdmin !== uid) {
            return res.status(403).json({ message: "Only group admin can delete this group" });
        }

        if (!conversation.isGroup) {
            // SOFT DELETE for 1-on-1: Add user to deletedBy array
            await Conversation.findByIdAndUpdate(conversationId, {
                $addToSet: { deletedBy: uid }
            });

            // Notify only the user who deleted it so their sidebar updates
            const io = req.app.get("io");
            if (io) {
                io.to(`user:${uid}`).emit("conversation:deleted", { conversationId });
            }

            return res.status(200).json({ success: true, message: "Conversation removed from your side" });
        }

        // HARD DELETE for Groups (Admin only)
        const participantsToNotify = [...new Set([
            ...(conversation.participants || []),
            conversation.sender,
            conversation.receiver
        ])].filter(id => id);

        console.log(`Hard deleting group conversation: ${conversationId}`);
        await Message.deleteMany({ conversationId });
        await Conversation.findByIdAndDelete(conversationId);

        // Notify all participants
        const io = req.app.get("io");
        if (io) {
            // Notify each participant individually so their list updates
            participantsToNotify.forEach(participantId => {
                io.to(`user:${participantId}`).emit("conversation:deleted", { conversationId });
            });
            // Also notify the room
            io.to(`conversation:${conversationId}`).emit("conversation:deleted", { conversationId });
        }

        return res.status(200).json({ success: true, message: "Conversation deleted for everyone" });

    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ message: "Failed to delete conversation", error: error.message });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { conversationId } = req.params;

        if (!uid) return res.status(400).json({ message: "User ID is required" });

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.isGroup) {
            return res.status(404).json({ message: "Group conversation not found" });
        }

        if (!conversation.participants.includes(uid)) {
            return res.status(400).json({ message: "You are not a participant" });
        }

        // Remove user
        conversation.participants = conversation.participants.filter(p => p !== uid);

        // If admin leaves, assign new admin if participants remain
        if (conversation.groupAdmin === uid) {
            if (conversation.participants.length > 0) {
                conversation.groupAdmin = conversation.participants[0];
            } else {
                // Empty group - delete it? or leave it empty?
                // Let's delete it if empty
                await Conversation.findByIdAndDelete(conversationId);
                await Message.deleteMany({ conversationId });
                return res.status(200).json({ success: true, message: "Group left and deleted (empty)" });
            }
        }

        await conversation.save();

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            // Fetch updated participants details to send to clients
            const updatedParticipants = await getUsersByUids(conversation.participants);
            const userMap = new Map(updatedParticipants.map(u => [u.uid, u]));
            const fullParticipants = conversation.participants.map(p => userMap.get(p) || { uid: p });

            io.to(`conversation:${conversationId}`).emit("group:update", {
                conversationId,
                participants: fullParticipants,
                groupAdmin: conversation.groupAdmin
            });
        }

        res.status(200).json({ success: true, message: "Left group successfully" });
    } catch (error) {
        console.error("Error leaving group:", error);
        res.status(500).json({ message: "Failed to leave group", error: error.message });
    }
};

export const removeMember = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { conversationId } = req.params;
        const { memberId } = req.body;

        if (!uid) return res.status(400).json({ message: "User ID is required" });

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.isGroup) {
            return res.status(404).json({ message: "Group conversation not found" });
        }

        // Only admin can remove
        if (conversation.groupAdmin !== uid) {
            return res.status(403).json({ message: "Only admin can remove members" });
        }

        if (!conversation.participants.includes(memberId)) {
            return res.status(400).json({ message: "User is not in this group" });
        }

        // Remove
        conversation.participants = conversation.participants.filter(p => p !== memberId);
        await conversation.save();

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            // Fetch updated participants details to send to clients
            const updatedParticipants = await getUsersByUids(conversation.participants);
            const userMap = new Map(updatedParticipants.map(u => [u.uid, u]));
            const fullParticipants = conversation.participants.map(p => userMap.get(p) || { uid: p });

            io.to(`conversation:${conversationId}`).emit("group:update", {
                conversationId,
                participants: fullParticipants,
                groupAdmin: conversation.groupAdmin
            });

            // Notify the removed user specifically
            io.to(`user:${memberId}`).emit("conversation:kicked", { conversationId });
        }

        res.status(200).json({ success: true, message: "Member removed successfully" });

    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ message: "Failed to remove member", error: error.message });
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { conversationId } = req.params;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "User ID is required in headers",
            });
        }

        // Verify conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
        }

        // Check if user is sender or receiver OR participant
        const isParticipant = (conversation.participants && conversation.participants.includes(uid)) ||
            conversation.sender === uid ||
            conversation.receiver === uid;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation",
            });
        }

        // Mark all unread messages as read (where user is receiver) - Only for 1-v-1 for now or if we adjust schema
        if (!conversation.isGroup) {
            await Message.updateMany(
                {
                    conversationId: conversationId,
                    receiver: uid,
                    isRead: false,
                },
                {
                    isRead: true,
                }
            );
        }

        // Reset unread count for this user
        conversation.unreadCount.set(uid.toString(), 0);
        await conversation.save();

        res.status(200).json({
            success: true,
            message: "Messages marked as read",
        });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark messages as read",
            error: error.message,
        });
    }
};
