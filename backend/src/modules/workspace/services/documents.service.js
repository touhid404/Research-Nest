import Document from "../../../models/document.model.js";
import Workspace from "../../../models/workspace.model.js";
import DocumentOwnership from "../../../models/documentOwnership.model.js";
import { getUsersByUids } from "./workspace.service.js";
import fs from "fs";
import path from "path";

// Helper to sanitize filenames
const sanitizeName = (name) => name.replace(/[^a-z0-9\s-_.]/gi, "_").trim();

// Helper to get full folder path recursively
export const getFolderPath = async (documentId) => {
    if (!documentId) return "";

    const doc = await Document.findById(documentId);
    if (!doc) return "";

    const parentPath = doc.parentId ? await getFolderPath(doc.parentId) : "";
    return path.join(parentPath, sanitizeName(doc.title));
};

// ============== DOCUMENT SERVICES ==============

export const createDocumentService = async ({ uid, workspaceId, title, type, parentId, fileData }) => {
    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Workspace access denied", status: 403 };
    }

    // Get max order for this workspace
    const maxOrderDoc = await Document.findOne({ workspaceId }).sort({ order: -1 });
    const order = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

    const document = new Document({
        workspaceId,
        title: title || "Untitled Document",
        type: type || "notes",
        createdBy: uid,
        parentId: parentId || null,
        order,
        ...fileData // Spread file metadata if present
    });

    await document.save();

    // Create ownership record
    const ownership = new DocumentOwnership({
        documentId: document._id,
        ownerId: uid,
        workspaceId
    });
    await ownership.save();

    // Populate creator for immediate UI update
    const users = await getUsersByUids([uid]);
    const creator = users[0] || { uid };

    const populatedDoc = {
        ...document.toObject(),
        _id: document._id.toString(), // Ensure string ID for consistency
        creator,
        createdBy: uid
    };

    // Create physical directory for folders
    if (type === "folder") {
        try {
            const parentPath = parentId ? await getFolderPath(parentId) : "";
            const folderName = sanitizeName(title || "Untitled Folder");
            const fullPath = path.join("public", "workspace-documents", parentPath, folderName);

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }
        } catch (error) {
            console.error("Failed to create physical directory:", error);
        }
    }

    // Create physical file for documents (not folders or uploaded files)
    if (type !== "folder" && !fileData) {
        try {
            const parentPath = parentId ? await getFolderPath(parentId) : "";
            const basePath = path.join("public", "workspace-documents", parentPath);

            // Ensure parent directory exists
            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath, { recursive: true });
            }

            const fileName = sanitizeName(title || "Untitled Document") + ".md";
            const filePath = path.join(basePath, fileName);
            fs.writeFileSync(filePath, ""); // Create empty file
        } catch (error) {
            console.error("Failed to create physical file:", error);
        }
    }

    return { data: populatedDoc, workspaceId };
};

export const getDocumentsService = async (uid, workspaceId) => {
    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Workspace access denied", status: 403 };
    }

    const documents = await Document.find({
        workspaceId,
        isArchived: false,
    }).sort({ order: 1 });

    // Get creator details via DocumentOwnership
    const ownerships = await DocumentOwnership.find({
        documentId: { $in: documents.map(d => d._id) }
    });
    const ownerMap = new Map(ownerships.map(o => [o.documentId.toString(), o.ownerId]));

    const users = await getUsersByUids([...new Set(ownerships.map(o => o.ownerId))]);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedDocs = documents.map((doc) => {
        const docObj = doc.toObject();
        const ownerId = ownerMap.get(doc._id.toString()) || doc.createdBy; // Fallback to original createdBy
        return {
            ...docObj,
            _id: doc._id.toString(),
            creator: userMap.get(ownerId) || { uid: ownerId },
            createdBy: ownerId
        };
    });

    return { data: populatedDocs };
};

export const getDocumentByIdService = async (id, uid) => {
    const document = await Document.findById(id);

    if (!document) {
        return { error: "Document not found", status: 404 };
    }

    // Verify workspace access
    const workspace = await Workspace.findById(document.workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Access denied", status: 403 };
    }

    return { data: document };
};

export const updateDocumentService = async (id, uid, updates) => {
    const document = await Document.findById(id);

    if (!document) {
        return { error: "Document not found", status: 404 };
    }

    // Verify workspace access
    const workspace = await Workspace.findById(document.workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Access denied", status: 403 };
    }

    // Update allowed fields
    const allowedUpdates = ["title", "type", "isArchived", "order", "parentId"];

    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            document[field] = updates[field];
        }
    });

    document.lastEditedBy = uid;
    await document.save();

    return { data: document, workspaceId: document.workspaceId };
};

export const saveDocumentContentService = async (id, uid, content, plainText) => {
    const document = await Document.findById(id);

    if (!document) {
        return { error: "Document not found", status: 404 };
    }

    // Verify workspace access
    const workspace = await Workspace.findById(document.workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Access denied", status: 403 };
    }

    if (content) {
        // Handle both array format (Yjs state) and base64 string (legacy)
        if (Array.isArray(content)) {
            document.content = Buffer.from(content);
        } else {
            document.content = Buffer.from(content, "base64");
        }
    }
    if (plainText !== undefined) {
        document.plainText = plainText;
    }

    document.lastEditedBy = uid;
    document.version += 1;

    await document.save();

    // Save content to physical file
    if (plainText !== undefined && document.type !== "folder" && !document.fileUrl) {
        try {
            const parentPath = document.parentId ? await getFolderPath(document.parentId) : "";
            const basePath = path.join("public", "workspace-documents", parentPath);
            const fileName = sanitizeName(document.title) + ".md";
            const filePath = path.join(basePath, fileName);

            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath, { recursive: true });
            }
            fs.writeFileSync(filePath, plainText);
        } catch (error) {
            console.error("Failed to save physical file:", error);
        }
    }

    return { data: { version: document.version } };
};

export const deleteDocumentService = async (id, uid) => {
    const document = await Document.findById(id);

    if (!document) {
        return { error: "Document not found", status: 404 };
    }

    // Verify workspace access
    const workspace = await Workspace.findById(document.workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Access denied", status: 403 };
    }

    // Check ownership via the new model with fallback to document.createdBy for legacy docs
    const ownership = await DocumentOwnership.findOne({ documentId: id });
    const ownerId = ownership ? ownership.ownerId : document.createdBy;

    if (ownerId !== uid) {
        return { error: "Only the owner can delete this item", status: 403 };
    }

    const workspaceId = document.workspaceId;

    // If it's a folder, recursively delete all children
    if (document.type === "folder") {
        const deleteChildren = async (parentId) => {
            const children = await Document.find({ parentId });
            for (const child of children) {
                if (child.type === "folder") {
                    await deleteChildren(child._id);
                }
                // Delete physical file if exists
                if (child.fileUrl) {
                    try {
                        const filePath = path.join("public", child.fileUrl);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (error) {
                        console.error("Failed to delete file:", error);
                    }
                }
                await child.deleteOne();
                await DocumentOwnership.deleteOne({ documentId: child._id });
            }
        };
        await deleteChildren(id);

        // Delete the folder directory if it exists
        try {
            const folderPath = await getFolderPath(id);
            const fullPath = path.join("public", "workspace-documents", folderPath);
            if (fs.existsSync(fullPath)) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        } catch (error) {
            console.error("Failed to delete folder directory:", error);
        }
    }

    // Delete physical file if exists
    if (document.fileUrl) {
        try {
            const filePath = path.join("public", document.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error("Failed to delete file:", error);
        }
    }

    // Delete physical file for documents (not folders or uploaded files)
    if (document.type !== "folder" && !document.fileUrl) {
        try {
            const parentPath = document.parentId ? await getFolderPath(document.parentId) : "";
            const fileName = sanitizeName(document.title) + ".md";
            const filePath = path.join("public", "workspace-documents", parentPath, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error("Failed to delete physical file:", error);
        }
    }

    await document.deleteOne();
    await DocumentOwnership.deleteOne({ documentId: id });

    return { data: { documentId: id }, workspaceId };
};

