import mongoose from "mongoose";

const proposalPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // reference to User
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    researchTopic: {
      type: String,
      required: true,
      trim: true,
    },
    interests: {
      type: [String], 
      default: [],
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "approved", "rejected"],
      default: "draft",
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const ProposalPost = mongoose.model("ProposalPost", proposalPostSchema);

export default ProposalPost;
