import mongoose from "mongoose";

const paperRequestSchema = new mongoose.Schema(
    {
        paperId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Paper",
            required: true,
        },
        requesterUid: {
            type: String,
            required: true,
        },
        authorUid: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Unique index to prevent multiple requests for the same paper by the same user
paperRequestSchema.index({ paperId: 1, requesterUid: 1 }, { unique: true });

const PaperRequest = mongoose.model("PaperRequest", paperRequestSchema);

export default PaperRequest;
