import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import User from "../../models/user.model.js";

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
        const conversations = await Conversation.find({
            $or: [{ sender: uid }, { receiver: uid }]
        })
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        // Get all unique user UIDs
        const userUids = [...new Set(conversations.flatMap(c => [c.sender, c.receiver]))];
        const users = await getUsersByUids(userUids);
        const userMap = new Map(users.map(u => [u.uid, u]));

        // Format response with participant details
        const formattedConversations = conversations.map((conv) => {
            const otherUserUid = conv.sender === uid ? conv.receiver : conv.sender;
            return {
                _id: conv._id,
                sender: userMap.get(conv.sender) || { uid: conv.sender },
                receiver: userMap.get(conv.receiver) || { uid: conv.receiver },
                otherUser: userMap.get(otherUserUid) || { uid: otherUserUid },
                lastMessage: conv.lastMessage,
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
        let conversation = await Conversation.findOne({
            $or: [
                { sender: uid, receiver: otherUserId },
                { sender: otherUserId, receiver: uid }
            ]
        }).populate("lastMessage");

        // Create new conversation if doesn't exist
        if (!conversation) {
            conversation = new Conversation({
                sender: uid,
                receiver: otherUserId,
            });
            await conversation.save();
        }

        // Fetch user details
        const users = await getUsersByUids([uid, otherUserId]);
        const userMap = new Map(users.map(u => [u.uid, u]));

        res.status(200).json({
            success: true,
            data: {
                ...conversation.toObject(),
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
        if (conversation.sender !== uid && conversation.receiver !== uid) {
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
        if (conversation.sender !== uid && conversation.receiver !== uid) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation",
            });
        }

        // Determine receiver
        const receiver = conversation.sender === uid ? conversation.receiver : conversation.sender;

        // Create message
        const message = new Message({
            conversationId: conversationId,
            sender: uid,
            receiver: receiver,
            text: text || "",
            attachment: attachment || null,
        });

        await message.save();

        // Get sender details
        const sender = await User.findOne({ uid }).select("name email photoURL uid");

        // Update conversation
        conversation.lastMessage = message._id;

        // Increment unread count for receiver
        const currentUnread = conversation.unreadCount.get(receiver.toString()) || 0;
        conversation.unreadCount.set(receiver.toString(), currentUnread + 1);
        conversation.markModified("unreadCount");

        await conversation.save();

        res.status(201).json({
            success: true,
            data: {
                ...message.toObject(),
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

        // Verify user is participant
        if (conversation.sender !== uid && conversation.receiver !== uid) {
            return res.status(403).json({ message: "Not authorized to delete this conversation" });
        }

        // Delete all messages in this conversation
        await Message.deleteMany({ conversationId });

        // Delete the conversation itself
        await Conversation.findByIdAndDelete(conversationId);

        res.status(200).json({ success: true, message: "Conversation deleted" });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ message: "Failed to delete conversation", error: error.message });
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

        // Check if user is sender or receiver
        if (conversation.sender !== uid && conversation.receiver !== uid) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation",
            });
        }

        // Mark all unread messages as read (where user is receiver)
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
