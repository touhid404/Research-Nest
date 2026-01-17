import { axiosInstance } from "./axios";

export const workspaceApi = {
    // ============== WORKSPACE ==============

    // Create a new workspace
    createWorkspace: async (data) => {
        const response = await axiosInstance.post("/workspaces", data);
        return response.data;
    },

    // Get all workspaces for current user
    getWorkspaces: async () => {
        const response = await axiosInstance.get("/workspaces");
        return response.data;
    },

    // Get single workspace by ID
    getWorkspaceById: async (id) => {
        const response = await axiosInstance.get(`/workspaces/${id}`);
        return response.data;
    },

    // Update workspace
    updateWorkspace: async (id, data) => {
        const response = await axiosInstance.put(`/workspaces/${id}`, data);
        return response.data;
    },

    // Add member to workspace
    addMember: async (workspaceId, memberUid, role = "member") => {
        const response = await axiosInstance.post(`/workspaces/${workspaceId}/members`, { memberUid, role });
        return response.data;
    },

    // Remove member from workspace
    removeMember: async (workspaceId, memberUid) => {
        const response = await axiosInstance.delete(`/workspaces/${workspaceId}/members`, {
            data: { memberUid }
        });
        return response.data;
    },

    // ============== TASKS ==============

    // Create task
    createTask: async (data) => {
        const response = await axiosInstance.post("/workspaces/tasks", data);
        return response.data;
    },

    // Get tasks for workspace
    getTasks: async (workspaceId, params = {}) => {
        const response = await axiosInstance.get(`/workspaces/${workspaceId}/tasks`, { params });
        return response.data;
    },

    // Get current user's tasks across all workspaces
    getMyTasks: async (params = {}) => {
        const response = await axiosInstance.get("/workspaces/tasks/my", { params });
        return response.data;
    },

    // Update task
    updateTask: async (taskId, data) => {
        const response = await axiosInstance.put(`/workspaces/tasks/${taskId}`, data);
        return response.data;
    },

    // Delete task
    deleteTask: async (taskId) => {
        const response = await axiosInstance.delete(`/workspaces/tasks/${taskId}`);
        return response.data;
    },

    // ============== MEETINGS ==============

    // Create meeting
    createMeeting: async (data) => {
        const response = await axiosInstance.post("/workspaces/meetings", data);
        return response.data;
    },

    // Get meetings for workspace
    getMeetings: async (workspaceId, params = {}) => {
        const response = await axiosInstance.get(`/workspaces/${workspaceId}/meetings`, { params });
        return response.data;
    },

    // Get current user's meetings across all workspaces
    getMyMeetings: async (params = {}) => {
        const response = await axiosInstance.get("/workspaces/meetings/my", { params });
        return response.data;
    },

    // Update meeting
    updateMeeting: async (meetingId, data) => {
        const response = await axiosInstance.put(`/workspaces/meetings/${meetingId}`, data);
        return response.data;
    },

    // Respond to meeting invitation
    respondToMeeting: async (meetingId, status) => {
        const response = await axiosInstance.put(`/workspaces/meetings/${meetingId}/respond`, { status });
        return response.data;
    },

    // Delete meeting
    deleteMeeting: async (meetingId) => {
        const response = await axiosInstance.delete(`/workspaces/meetings/${meetingId}`);
        return response.data;
    },

    // ============== DOCUMENTS ==============

    // Create document
    createDocument: async (data) => {
        const response = await axiosInstance.post("/workspaces/documents", data);
        return response.data;
    },

    // Get documents for workspace
    getDocuments: async (workspaceId) => {
        const response = await axiosInstance.get(`/workspaces/${workspaceId}/documents`);
        return response.data;
    },

    // Get single document
    getDocumentById: async (documentId) => {
        const response = await axiosInstance.get(`/workspaces/documents/${documentId}`);
        return response.data;
    },

    // Update document metadata
    updateDocument: async (documentId, data) => {
        const response = await axiosInstance.put(`/workspaces/documents/${documentId}`, data);
        return response.data;
    },

    // Save document content
    saveDocumentContent: async (documentId, content, plainText) => {
        const response = await axiosInstance.put(`/workspaces/documents/${documentId}/content`, {
            content,
            plainText,
        });
        return response.data;
    },

    // Upload document file
    uploadDocument: async (data) => {
        const response = await axiosInstance.post("/workspaces/documents/upload", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // Delete document
    deleteDocument: async (documentId) => {
        const response = await axiosInstance.delete(`/workspaces/documents/${documentId}`);
        return response.data;
    },
};
