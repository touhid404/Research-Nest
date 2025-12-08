import mongoose from "mongoose";

const proposalPostSchema = new mongoose.Schema(
  {
    user: {
      uid: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      photoURL: { type: String, required: true },
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
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "approved", "rejected"],
      default: "draft",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const ProposalPost = mongoose.model("ProposalPost", proposalPostSchema);

export default ProposalPost;
