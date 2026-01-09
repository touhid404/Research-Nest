import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        ownerUid: {
            type: String,
            required: true,
        },
        members: [
            {
                uid: { type: String, required: true },
                role: {
                    type: String,
                    enum: ["owner", "admin", "member"],
                    default: "member",
                },
                joinedAt: { type: Date, default: Date.now },
            }
        ],
        // Link to the proposal post that formed this group
        proposalPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProposalPost",
            default: null,
        },
        // Link to conversation for group chat
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            default: null,
        },
        status: {
            type: String,
            enum: ["active", "completed", "archived"],
            default: "active",
        },
    },
    { timestamps: true }
);

workspaceSchema.index({ ownerUid: 1 });
workspaceSchema.index({ "members.uid": 1 });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
