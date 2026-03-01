import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        scheduledBy: {
            type: String, // uid
            required: true,
        },
        participants: [
            {
                uid: { type: String, required: true },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "declined"],
                    default: "pending",
                },
            }
        ],
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            default: null,
        },
        // Duration in minutes (optional, used when endTime is not set)
        duration: {
            type: Number,
            default: null,
        },
        // Instant meeting flag
        isInstant: {
            type: Boolean,
            default: false,
        },
        // Meeting room ID for video calls
        roomId: {
            type: String,
            unique: true,
            sparse: true,
        },
        // Meeting status
        status: {
            type: String,
            enum: ["scheduled", "live", "completed", "cancelled"],
            default: "scheduled",
        },
        // Recording & AI Summary
        recordingStatus: {
            type: String,
            enum: ["none", "processing", "completed", "failed"],
            default: "none",
        },
        transcript: {
            type: String,
            default: "",
        },
        summary: {
            summary: [String],
            actionItems: [{
                who: String,
                action: String,
                due: String,
            }],
            decisions: [String],
        },
        summaryGeneratedAt: {
            type: Date,
            default: null,
        },
        recordedBy: {
            type: String, // uid
            default: null,
        },
        recordedByName: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

meetingSchema.index({ workspaceId: 1 });
meetingSchema.index({ startTime: 1 });
meetingSchema.index({ "participants.uid": 1 });

// Generate unique room ID before saving
meetingSchema.pre("save", function (next) {
    if (!this.roomId) {
        this.roomId = `meet-${this._id.toString().slice(-8)}-${Date.now().toString(36)}`;
    }
    next();
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
