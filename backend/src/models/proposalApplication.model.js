import mongoose from "mongoose";


const proposalApplicationSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
            required: true,
        },
        receiverId: {
            type: String,
            required: true,
        },
        proposalPostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProposalPost",
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "group_formed"],
            default: "pending",
        },
    },
    { timestamps: true }
);


// Ensure a user can only apply once to a post (optional but good practice)
proposalApplicationSchema.index({ senderId: 1, proposalPostId: 1 }, { unique: true });


const ProposalApplication = mongoose.model("ProposalApplication", proposalApplicationSchema);


export default ProposalApplication;

