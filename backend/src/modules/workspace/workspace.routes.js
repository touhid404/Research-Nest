import express from "express";
import {
    createWorkspace,
    getWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    addMember,
    removeMember,
} from "./controllers/workspace.controller.js";

import {
    createTask,
    getTasks,
    getMyTasks,
    updateTask,
    deleteTask,
} from "./controllers/tasks.controller.js";

import {
    createMeeting,
    getMeetings,
    getMyMeetings,
    updateMeeting,
    respondToMeeting,
    deleteMeeting,
} from "./controllers/meetings.controller.js";

import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    saveDocumentContent,
    deleteDocument,
} from "./controllers/documents.controller.js";

import { getVideoToken } from "./controllers/video.controller.js";

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

// Video routes
router.post("/video/token", getVideoToken);

export const workspaceRoutes = router;
