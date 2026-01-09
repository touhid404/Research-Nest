import {
    getUsersByUids,
    createWorkspaceService,
    getWorkspacesService,
    getWorkspaceByIdService,
    updateWorkspaceService,
    addMemberService,
    removeMemberService,
    createTaskService,
    getTasksService,
    getMyTasksService,
    updateTaskService,
    deleteTaskService,
    createMeetingService,
    getMeetingsService,
    getMyMeetingsService,
    updateMeetingService,
    respondToMeetingService,
    deleteMeetingService,
    createDocumentService,
    getDocumentsService,
    getDocumentByIdService,
    updateDocumentService,
    saveDocumentContentService,
    deleteDocumentService,
} from "./workspace.service.js";

// ============== WORKSPACE CONTROLLERS ==============

export const createWorkspace = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { name, description, memberUids, proposalPostId, conversationId } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        if (!name) {
            return res.status(400).json({ success: false, message: "Workspace name required" });
        }

        const workspace = await createWorkspaceService({
            uid,
            name,
            description,
            memberUids,
            proposalPostId,
            conversationId,
        });

        res.status(201).json({ success: true, data: workspace });
    } catch (error) {
        console.error("Error creating workspace:", error);
        res.status(500).json({ success: false, message: "Failed to create workspace" });
    }
};

export const getWorkspaces = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const workspaces = await getWorkspacesService(uid);
        res.status(200).json({ success: true, data: workspaces });
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        res.status(500).json({ success: false, message: "Failed to fetch workspaces" });
    }
};

export const getWorkspaceById = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const result = await getWorkspaceByIdService(id, uid);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching workspace:", error);
        res.status(500).json({ success: false, message: "Failed to fetch workspace" });
    }
};

export const updateWorkspace = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await updateWorkspaceService(id, uid, req.body);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error updating workspace:", error);
        res.status(500).json({ success: false, message: "Failed to update workspace" });
    }
};

export const addMember = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;
        const { memberUid, role = "member" } = req.body;

        const result = await addMemberService(id, uid, memberUid, role);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json({ success: false, message: "Failed to add member" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;
        const { memberUid } = req.body;

        const result = await removeMemberService(id, uid, memberUid);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error removing member:", error);
        res.status(500).json({ success: false, message: "Failed to remove member" });
    }
};

// ============== TASK CONTROLLERS ==============

export const createTask = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { workspaceId, title, description, assignedTo, dueDate, startDate, priority, labels } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const result = await createTaskService({
            uid,
            workspaceId,
            title,
            description,
            assignedTo,
            dueDate,
            startDate,
            priority,
            labels,
        });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event for real-time update
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("task:created", result.data);
        }

        res.status(201).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ success: false, message: "Failed to create task" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { workspaceId } = req.params;
        const { status, assignedTo, startDate, endDate, limit, upcoming } = req.query;

        const result = await getTasksService(uid, workspaceId, {
            status,
            assignedTo,
            startDate,
            endDate,
            limit,
            upcoming,
        });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ success: false, message: "Failed to fetch tasks" });
    }
};

export const getMyTasks = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { startDate, endDate, status } = req.query;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const result = await getMyTasksService(uid, { startDate, endDate, status });

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching user tasks:", error);
        res.status(500).json({ success: false, message: "Failed to fetch tasks" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await updateTaskService(id, uid, req.body);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("task:updated", result.data);
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ success: false, message: "Failed to update task" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await deleteTaskService(id, uid);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("task:deleted", { taskId: id });
        }

        res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ success: false, message: "Failed to delete task" });
    }
};

// ============== MEETING CONTROLLERS ==============

export const createMeeting = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const {
            workspaceId, title, description, startTime, endTime,
            participants, type, isRecurring, recurrencePattern, externalLink,
            isInstant, duration
        } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        // For non-instant meetings, startTime is required
        if (!isInstant && !startTime) {
            return res.status(400).json({ success: false, message: "Start time is required for scheduled meetings" });
        }

        const result = await createMeetingService({
            uid,
            workspaceId,
            title,
            description,
            startTime,
            endTime,
            participants,
            type,
            isRecurring,
            recurrencePattern,
            externalLink,
            isInstant,
            duration,
        });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("meeting:created", result.data);
        }

        res.status(201).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ success: false, message: "Failed to create meeting" });
    }
};

export const getMeetings = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { workspaceId } = req.params;
        const { startDate, endDate, status, limit, upcoming } = req.query;

        const result = await getMeetingsService(uid, workspaceId, {
            startDate,
            endDate,
            status,
            limit,
            upcoming,
        });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch meetings" });
    }
};

export const getMyMeetings = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { startDate, endDate } = req.query;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const result = await getMyMeetingsService(uid, { startDate, endDate });

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching user meetings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch meetings" });
    }
};

export const updateMeeting = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await updateMeetingService(id, uid, req.body);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("meeting:updated", result.data);
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error updating meeting:", error);
        res.status(500).json({ success: false, message: "Failed to update meeting" });
    }
};

export const respondToMeeting = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;
        const { status } = req.body;

        const result = await respondToMeetingService(id, uid, status);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error responding to meeting:", error);
        res.status(500).json({ success: false, message: "Failed to respond to meeting" });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const uid = req.headers["x-user-id"];
        const { id } = req.params;

        const result = await deleteMeetingService(id, uid);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("meeting:deleted", { meetingId: id });
        }

        res.status(200).json({ success: true, message: "Meeting deleted" });
    } catch (error) {
        console.error("Error deleting meeting:", error);
        res.status(500).json({ success: false, message: "Failed to delete meeting" });
    }
};

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

// Export getUsersByUids for backward compatibility if needed elsewhere
export { getUsersByUids };
