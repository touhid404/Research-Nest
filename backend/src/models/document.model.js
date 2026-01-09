import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
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
            default: "Untitled Document",
        },
        // Yjs document state (binary)
        content: {
            type: Buffer,
            default: null,
        },
        // Plain text content for search/preview
        plainText: {
            type: String,
            default: "",
        },
        createdBy: {
            type: String, // uid
            required: true,
        },
        lastEditedBy: {
            type: String, // uid
            default: null,
        },
        // Collaborators currently editing
        activeEditors: [
            {
                uid: { type: String },
                name: { type: String },
                color: { type: String },
                cursor: { type: Number, default: 0 },
            }
        ],
        // Document type
        type: {
            type: String,
            enum: ["research_paper", "notes", "outline", "draft", "other"],
            default: "notes",
        },
        // Version tracking
        version: {
            type: Number,
            default: 1,
        },
        // Parent document for hierarchical structure
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            default: null,
        },
        // Document order within workspace
        order: {
            type: Number,
            default: 0,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

documentSchema.index({ workspaceId: 1 });
documentSchema.index({ createdBy: 1 });
documentSchema.index({ parentId: 1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
