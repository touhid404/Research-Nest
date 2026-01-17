import mongoose from "mongoose";

const documentOwnershipSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true
        },
        ownerId: {
            type: String, // Firebase uid
            required: true,
            index: true
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true
        }
    },
    {
        timestamps: true,
    }
);

// Unique index to ensure one owner per document per workspace (though one owner per doc is enough)
documentOwnershipSchema.index({ documentId: 1, ownerId: 1 }, { unique: true });

const DocumentOwnership = mongoose.model("DocumentOwnership", documentOwnershipSchema);

export default DocumentOwnership;
