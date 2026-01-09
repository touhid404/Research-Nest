import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
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
        assignedTo: [
            {
                type: String, // uid
            }
        ],
        createdBy: {
            type: String, // uid
            required: true,
        },
        status: {
            type: String,
            enum: ["todo", "in_progress", "review", "completed"],
            default: "todo",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        dueDate: {
            type: Date,
            default: null,
        },
        startDate: {
            type: Date,
            default: null,
        },
        // Time tracking
        estimatedHours: {
            type: Number,
            default: null,
        },
        labels: [
            {
                type: String,
            }
        ],
        // Sub-tasks/checklist
        checklist: [
            {
                text: { type: String, required: true },
                completed: { type: Boolean, default: false },
            }
        ],
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

taskSchema.index({ workspaceId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
