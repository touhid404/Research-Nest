import { create } from 'zustand';
import { workspaceApi } from '../lib/workspaceApi';

const initialState = {
    // State
    workspaces: [],
    selectedWorkspace: null,
    tasks: [],
    meetings: [],
    documents: [],
    myTasks: [],
    myMeetings: [],
    isLoading: false,
    error: null,
    
    // Loading states for different data types
    loadingTasks: false,
    loadingMeetings: false,
    loadingDocuments: false,
    
    // Cache to track what's been loaded
    loadedWorkspaceData: {},

    // Socket reference
    socket: null,

    // Active document editing state
    activeDocument: null,
    documentCollaborators: [],
};

const useWorkspaceStore = create((set, get) => ({
    ...initialState,

    // Reset store to initial state (call on logout)
    resetStore: () => {
        const currentSocket = get().socket;
        // Leave all workspace rooms if socket exists
        if (currentSocket) {
            const workspaces = get().workspaces;
            workspaces.forEach(w => {
                currentSocket.emit("workspace:leave", w._id);
            });
        }
        set(initialState);
    },

    // Actions
    setSocket: (socket) => set({ socket }),

    setSelectedWorkspace: (workspace) => set((state) => ({ 
        selectedWorkspace: workspace,
        tasks: [],
        meetings: [],
        documents: [],
        // Clear cache for previous workspace
        loadedWorkspaceData: workspace?._id !== state.selectedWorkspace?._id ? {} : state.loadedWorkspaceData,
    })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // ============== WORKSPACE ACTIONS ==============

    fetchWorkspaces: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await workspaceApi.getWorkspaces();
            set({ workspaces: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchWorkspaceById: async (id) => {
        const state = get();
        // Skip if same workspace is already loaded
        if (state.selectedWorkspace?._id === id && !state.isLoading) {
            return state.selectedWorkspace;
        }
        
        set({ isLoading: true, error: null });
        try {
            const response = await workspaceApi.getWorkspaceById(id);
            set({ selectedWorkspace: response.data, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    createWorkspace: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await workspaceApi.createWorkspace(data);
            const newWorkspace = response.data;
            set((state) => ({
                workspaces: [newWorkspace, ...state.workspaces],
                isLoading: false,
            }));
            return newWorkspace;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateWorkspace: async (id, data) => {
        try {
            const response = await workspaceApi.updateWorkspace(id, data);
            set((state) => ({
                workspaces: state.workspaces.map((w) =>
                    w._id === id ? response.data : w
                ),
                selectedWorkspace: state.selectedWorkspace?._id === id
                    ? response.data
                    : state.selectedWorkspace,
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // ============== TASK ACTIONS ==============

    fetchTasks: async (workspaceId, params = {}) => {
        const state = get();
        const cacheKey = `${workspaceId}_tasks_${JSON.stringify(params)}`;
        
        // Check if already loaded (unless force refresh)
        if (!params.forceRefresh && state.loadedWorkspaceData[cacheKey]) {
            return;
        }
        
        set({ loadingTasks: true, error: null });
        try {
            const response = await workspaceApi.getTasks(workspaceId, params);
            set((state) => ({ 
                tasks: response.data, 
                loadingTasks: false,
                loadedWorkspaceData: { ...state.loadedWorkspaceData, [cacheKey]: true }
            }));
        } catch (error) {
            set({ error: error.message, loadingTasks: false });
        }
    },

    fetchMyTasks: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await workspaceApi.getMyTasks(params);
            set({ myTasks: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    createTask: async (data) => {
        try {
            const response = await workspaceApi.createTask(data);
            set((state) => ({
                tasks: [...state.tasks, response.data],
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    updateTask: async (taskId, data) => {
        try {
            const response = await workspaceApi.updateTask(taskId, data);
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t._id === taskId ? response.data : t
                ),
                myTasks: state.myTasks.map((t) =>
                    t._id === taskId ? response.data : t
                ),
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteTask: async (taskId) => {
        try {
            await workspaceApi.deleteTask(taskId);
            set((state) => ({
                tasks: state.tasks.filter((t) => t._id !== taskId),
                myTasks: state.myTasks.filter((t) => t._id !== taskId),
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // ============== MEETING ACTIONS ==============

    fetchMeetings: async (workspaceId, params = {}) => {
        const state = get();
        const cacheKey = `${workspaceId}_meetings_${JSON.stringify(params)}`;
        
        // Check if already loaded (unless force refresh)
        if (!params.forceRefresh && state.loadedWorkspaceData[cacheKey]) {
            return;
        }
        
        set({ loadingMeetings: true, error: null });
        try {
            const response = await workspaceApi.getMeetings(workspaceId, params);
            set((state) => ({ 
                meetings: response.data, 
                loadingMeetings: false,
                loadedWorkspaceData: { ...state.loadedWorkspaceData, [cacheKey]: true }
            }));
        } catch (error) {
            set({ error: error.message, loadingMeetings: false });
        }
    },

    fetchMyMeetings: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await workspaceApi.getMyMeetings(params);
            set({ myMeetings: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    createMeeting: async (data) => {
        try {
            const response = await workspaceApi.createMeeting(data);
            // Don't add to state here - socket event will handle it for all users including creator
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    updateMeeting: async (meetingId, data) => {
        try {
            const response = await workspaceApi.updateMeeting(meetingId, data);
            set((state) => ({
                meetings: state.meetings.map((m) =>
                    m._id === meetingId ? response.data : m
                ),
                myMeetings: state.myMeetings.map((m) =>
                    m._id === meetingId ? response.data : m
                ),
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    respondToMeeting: async (meetingId, status) => {
        try {
            const response = await workspaceApi.respondToMeeting(meetingId, status);
            set((state) => ({
                meetings: state.meetings.map((m) =>
                    m._id === meetingId ? response.data : m
                ),
                myMeetings: state.myMeetings.map((m) =>
                    m._id === meetingId ? response.data : m
                ),
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteMeeting: async (meetingId) => {
        try {
            await workspaceApi.deleteMeeting(meetingId);
            set((state) => ({
                meetings: state.meetings.filter((m) => m._id !== meetingId),
                myMeetings: state.myMeetings.filter((m) => m._id !== meetingId),
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // ============== DOCUMENT ACTIONS ==============

    fetchDocuments: async (workspaceId, forceRefresh = false) => {
        const state = get();
        const cacheKey = `${workspaceId}_documents`;
        
        // Check if already loaded (unless force refresh)
        if (!forceRefresh && state.loadedWorkspaceData[cacheKey]) {
            return;
        }
        
        set({ loadingDocuments: true, error: null });
        try {
            const response = await workspaceApi.getDocuments(workspaceId);
            set((state) => ({ 
                documents: response.data, 
                loadingDocuments: false,
                loadedWorkspaceData: { ...state.loadedWorkspaceData, [cacheKey]: true }
            }));
        } catch (error) {
            set({ error: error.message, loadingDocuments: false });
        }
    },

    createDocument: async (workspaceId, data) => {
        try {
            const response = await workspaceApi.createDocument({ ...data, workspaceId });
            set((state) => ({
                documents: [...state.documents, response.data],
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    updateDocument: async (workspaceId, documentId, data) => {
        try {
            const response = await workspaceApi.updateDocument(documentId, data);
            set((state) => ({
                documents: state.documents.map((d) =>
                    d._id === documentId ? response.data : d
                ),
            }));
            return response.data;
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    setActiveDocument: (document) => set({ activeDocument: document }),

    setDocumentCollaborators: (collaborators) => set({ documentCollaborators: collaborators }),

    deleteDocument: async (workspaceId, documentId) => {
        try {
            await workspaceApi.deleteDocument(documentId);
            set((state) => ({
                documents: state.documents.filter((d) => d._id !== documentId),
            }));
        } catch (error) {
            set({ error: error.message });
            throw error;
        }
    },

    // ============== SOCKET EVENT HANDLERS ==============

    subscribeToWorkspace: (socket, workspaceId) => {
        if (!socket) return;

        socket.emit("workspace:join", workspaceId);

        // Task events
        socket.on("task:created", (task) => {
            set((state) => ({
                tasks: [...state.tasks, task],
            }));
        });

        socket.on("task:updated", (task) => {
            set((state) => ({
                tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
            }));
        });

        socket.on("task:deleted", ({ taskId }) => {
            set((state) => ({
                tasks: state.tasks.filter((t) => t._id !== taskId),
            }));
        });

        // Meeting events
        socket.on("meeting:created", (meeting) => {
            set((state) => {
                // Avoid duplicates - check if meeting already exists
                const exists = state.meetings.some(m => m._id === meeting._id);
                if (exists) return state;
                return {
                    meetings: [...state.meetings, meeting],
                };
            });
        });

        socket.on("meeting:updated", (meeting) => {
            set((state) => ({
                meetings: state.meetings.map((m) => (m._id === meeting._id ? meeting : m)),
                myMeetings: state.myMeetings.map((m) => (m._id === meeting._id ? meeting : m)),
            }));
        });

        socket.on("meeting:deleted", ({ meetingId }) => {
            set((state) => ({
                meetings: state.meetings.filter((m) => m._id !== meetingId),
                myMeetings: state.myMeetings.filter((m) => m._id !== meetingId),
            }));
        });

        // Document events
        socket.on("document:created", (document) => {
            set((state) => ({
                documents: [...state.documents, document],
            }));
        });

        socket.on("document:updated", (document) => {
            set((state) => ({
                documents: state.documents.map((d) => (d._id === document._id ? document : d)),
            }));
        });

        socket.on("document:deleted", ({ documentId }) => {
            set((state) => ({
                documents: state.documents.filter((d) => d._id !== documentId),
            }));
        });

        // Document collaborator events
        socket.on("document:collaborators", ({ documentId, collaborators }) => {
            const { activeDocument } = get();
            if (activeDocument?._id === documentId) {
                set({ documentCollaborators: collaborators });
            }
        });
    },

    unsubscribeFromWorkspace: (socket, workspaceId) => {
        if (!socket) return;

        socket.emit("workspace:leave", workspaceId);

        // Remove listeners
        socket.off("task:created");
        socket.off("task:updated");
        socket.off("task:deleted");
        socket.off("meeting:created");
        socket.off("meeting:updated");
        socket.off("meeting:deleted");
        socket.off("document:created");
        socket.off("document:updated");
        socket.off("document:deleted");
        socket.off("document:collaborators");
    },

    // Document collaboration socket methods
    joinDocument: (socket, documentId, userName) => {
        if (!socket) return;
        socket.emit("document:join", { documentId, userName });
    },

    leaveDocument: (socket, documentId) => {
        if (!socket) return;
        socket.emit("document:leave", documentId);
    },

    sendDocumentUpdate: (socket, documentId, update) => {
        if (!socket) return;
        socket.emit("document:update", { documentId, update });
    },

    sendCursorPosition: (socket, documentId, cursor, selection) => {
        if (!socket) return;
        socket.emit("document:cursor", { documentId, cursor, selection });
    },
}));

export default useWorkspaceStore;
export { useWorkspaceStore };
