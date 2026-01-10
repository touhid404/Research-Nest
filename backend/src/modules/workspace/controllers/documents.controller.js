import {
    createDocumentService,
    getDocumentsService,
    getDocumentByIdService,
    updateDocumentService,
    saveDocumentContentService,
    deleteDocumentService,
} from "../services/documents.service.js";

// ============== DOCUMENT CONTROLLERS ==============

export const createDocument = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { workspaceId, title, type, parentId } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const result = await createDocumentService({
            uid,
            workspaceId,
            title,
            type,
            parentId,
        });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("document:created", result.data);
        }

        res.status(201).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error creating document:", error);
        res.status(500).json({ success: false, message: "Failed to create document" });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { workspaceId } = req.params;

        const result = await getDocumentsService(uid, workspaceId);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ success: false, message: "Failed to fetch documents" });
    }
};

export const getDocumentById = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await getDocumentByIdService(id, uid);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({ success: false, message: "Failed to fetch document" });
    }
};

export const updateDocument = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await updateDocumentService(id, uid, req.body);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("document:updated", result.data);
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({ success: false, message: "Failed to update document" });
    }
};

export const saveDocumentContent = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;
        const { content, plainText } = req.body;

        const result = await saveDocumentContentService(id, uid, content, plainText);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error saving document content:", error);
        res.status(500).json({ success: false, message: "Failed to save document content" });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await deleteDocumentService(id, uid);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("document:deleted", { documentId: id });
        }

        res.status(200).json({ success: true, message: "Document deleted" });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ success: false, message: "Failed to delete document" });
    }
};
