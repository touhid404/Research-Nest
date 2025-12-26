import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: false, // Not required for groups
    },
    receiver: {
      type: String,
      required: false, // Not required for groups
    },
    participants: [
      {
        type: String,
        required: true
      }
    ],
    isGroup: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      default: ""
    },
    groupAdmin: {
      type: String, // UID of admin
      default: null
    },

    // Stores the last message ID from Message collection
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // unreadCount: { userId: number }
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    deletedBy: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

// Optimization indexes
conversationSchema.index({ sender: 1 });
conversationSchema.index({ receiver: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
