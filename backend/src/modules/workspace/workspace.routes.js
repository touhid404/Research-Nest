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
    uploadDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    saveDocumentContent,
    deleteDocument,
} from "./controllers/documents.controller.js";

import { getVideoToken } from "./controllers/video.controller.js";
import authCheck from "../../middleware/authCheck.js";

const router = express.Router();
// workspace routes
router.post("/", authCheck(), createWorkspace);
router.get("/", authCheck(), getWorkspaces);
router.get("/:id", authCheck(), getWorkspaceById);
router.put("/:id", authCheck(), updateWorkspace);
router.post("/:id/members", authCheck(), addMember);
router.delete("/:id/members", authCheck(), removeMember);


// Assign task routes
router.post("/tasks", authCheck(), createTask);
router.get("/tasks/my", authCheck(), getMyTasks); // User's tasks across all workspaces
router.get("/:workspaceId/tasks", authCheck(), getTasks);
router.put("/tasks/:id", authCheck(), updateTask);
router.delete("/tasks/:id", authCheck(), deleteTask);


// Meeting routes
router.post("/meetings", authCheck(), createMeeting);
router.get("/meetings/my", authCheck(), getMyMeetings); // User's meetings across all workspaces
router.get("/:workspaceId/meetings", authCheck(), getMeetings);
router.put("/meetings/:id", authCheck(), updateMeeting);
router.put("/meetings/:id/respond", authCheck(), respondToMeeting);
router.delete("/meetings/:id", authCheck(), deleteMeeting);


// Document routes
router.post("/documents/upload", authCheck(), uploadDocument);
router.post("/documents", authCheck(), createDocument);
router.get("/:workspaceId/documents", authCheck(), getDocuments);
router.get("/documents/:id", authCheck(), getDocumentById);
router.put("/documents/:id", authCheck(), updateDocument);
router.put("/documents/:id/content", authCheck(), saveDocumentContent);
router.delete("/documents/:id", authCheck(), deleteDocument);

// Video routes
router.post("/video/token", authCheck(), getVideoToken);

export const workspaceRoutes = router;
