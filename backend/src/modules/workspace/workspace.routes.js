import express from "express";
import {
    // Workspace
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    addMember,
    removeMember,
    // Tasks
    createTask,
    getTasks,
    getMyTasks,
    updateTask,
    deleteTask,
    // Meetings
    createMeeting,
    getMeetings,
    getMyMeetings,
    updateMeeting,
    respondToMeeting,
    deleteMeeting,
    // Documents
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    saveDocumentContent,
    deleteDocument,
} from "./workspace.controller.js";

const router = express.Router();
// workspace routes
router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.get("/:id", getWorkspaceById);
router.put("/:id", updateWorkspace);
router.post("/:id/members", addMember);
router.delete("/:id/members", removeMember);


// Assign task routes
router.post("/tasks", createTask);
router.get("/tasks/my", getMyTasks); // User's tasks across all workspaces
router.get("/:workspaceId/tasks", getTasks);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);


// Meeting routes
router.post("/meetings", createMeeting);
router.get("/meetings/my", getMyMeetings); // User's meetings across all workspaces
router.get("/:workspaceId/meetings", getMeetings);
router.put("/meetings/:id", updateMeeting);
router.put("/meetings/:id/respond", respondToMeeting);
router.delete("/meetings/:id", deleteMeeting);


// Document routes
router.post("/documents", createDocument);
router.get("/:workspaceId/documents", getDocuments);
router.get("/documents/:id", getDocumentById);
router.put("/documents/:id", updateDocument);
router.put("/documents/:id/content", saveDocumentContent);
router.delete("/documents/:id", deleteDocument);

export const workspaceRoutes = router;
