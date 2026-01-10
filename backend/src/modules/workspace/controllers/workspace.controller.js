import {
    getUsersByUids,
    createWorkspaceService,
    getWorkspacesService,
    getWorkspaceByIdService,
    updateWorkspaceService,
    addMemberService,
    removeMemberService,
} from "../services/workspace.service.js";

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

export { getUsersByUids };
