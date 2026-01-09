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
            required: true,
        },
        // Meeting room ID for video calls
        roomId: {
            type: String,
            unique: true,
            sparse: true,
        },
        // Meeting type
        type: {
            type: String,
            enum: ["video", "audio", "in_person"],
            default: "video",
        },
        // Meeting status
        status: {
            type: String,
            enum: ["scheduled", "live", "completed", "cancelled"],
            default: "scheduled",
        },
        // Recurrence
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurrencePattern: {
            type: String,
            enum: ["daily", "weekly", "biweekly", "monthly", null],
            default: null,
        },
        // Meeting link (for external links like Google Meet)
        externalLink: {
            type: String,
            default: null,
        },
        // Meeting notes
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

meetingSchema.index({ workspaceId: 1 });
meetingSchema.index({ startTime: 1 });
meetingSchema.index({ "participants.uid": 1 });
// Note: roomId index is already created by unique: true in the schema definition

// Generate unique room ID before saving
meetingSchema.pre("save", function (next) {
    if (!this.roomId && this.type === "video") {
        this.roomId = `meet-${this._id.toString().slice(-8)}-${Date.now().toString(36)}`;
    }
    next();
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
