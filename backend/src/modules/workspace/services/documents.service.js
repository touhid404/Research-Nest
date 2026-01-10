import Document from "../../../models/document.model.js";
import Workspace from "../../../models/workspace.model.js";
import { getUsersByUids } from "./workspace.service.js";

// ============== DOCUMENT SERVICES ==============

export const createDocumentService = async ({ uid, workspaceId, title, type, parentId }) => {
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
    });

    await document.save();

    return { data: document, workspaceId };
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

    // Get creator details
    const creatorUids = [...new Set(documents.map((d) => d.createdBy))];
    const users = await getUsersByUids(creatorUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedDocs = documents.map((doc) => ({
        ...doc.toObject(),
        creator: userMap.get(doc.createdBy) || { uid: doc.createdBy },
    }));

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
        document.content = Buffer.from(content, "base64");
    }
    if (plainText !== undefined) {
        document.plainText = plainText;
    }

    document.lastEditedBy = uid;
    document.version += 1;

    await document.save();

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

    const workspaceId = document.workspaceId;
    await document.deleteOne();

    return { data: { documentId: id }, workspaceId };
};
