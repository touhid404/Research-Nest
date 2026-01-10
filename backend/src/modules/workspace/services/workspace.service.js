import Workspace from "../../../models/workspace.model.js";
import User from "../../../models/user.model.js";

// Helper to get user details by UIDs
export const getUsersByUids = async (uids) => {
    return await User.find({ uid: { $in: uids } }).select("name email photoURL uid");
};

// ============== WORKSPACE SERVICES ==============

export const createWorkspaceService = async ({ uid, name, description, memberUids, proposalPostId, conversationId }) => {
    // Prepare members array with owner
    const members = [{ uid, role: "owner", joinedAt: new Date() }];

    // Add other members if provided
    if (memberUids && Array.isArray(memberUids)) {
        memberUids.forEach((memberUid) => {
            if (memberUid !== uid) {
                members.push({ uid: memberUid, role: "member", joinedAt: new Date() });
            }
        });
    }

    const workspace = new Workspace({
        name,
        description: description || "",
        ownerUid: uid,
        members,
        proposalPostId: proposalPostId || null,
        conversationId: conversationId || null,
    });

    await workspace.save();

    // Populate member details
    const memberDetails = await getUsersByUids(members.map((m) => m.uid));
    const memberMap = new Map(memberDetails.map((u) => [u.uid, u]));

    const populatedMembers = workspace.members.map((m) => ({
        ...m.toObject(),
        user: memberMap.get(m.uid) || { uid: m.uid },
    }));

    return { ...workspace.toObject(), members: populatedMembers };
};

export const getWorkspacesService = async (uid) => {
    const workspaces = await Workspace.find({
        "members.uid": uid,
        status: { $ne: "archived" },
    }).sort({ updatedAt: -1 });

    // Get all member details
    const allMemberUids = [...new Set(workspaces.flatMap((w) => w.members.map((m) => m.uid)))];
    const users = await getUsersByUids(allMemberUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedWorkspaces = workspaces.map((ws) => ({
        ...ws.toObject(),
        members: ws.members.map((m) => ({
            ...m.toObject(),
            user: userMap.get(m.uid) || { uid: m.uid },
        })),
    }));

    return populatedWorkspaces;
};

export const getWorkspaceByIdService = async (id, uid) => {
    const workspace = await Workspace.findById(id);

    if (!workspace) {
        return { error: "Workspace not found", status: 404 };
    }

    // Check if user is a member
    const isMember = workspace.members.some((m) => m.uid === uid);
    if (!isMember) {
        return { error: "Access denied", status: 403 };
    }

    // Get member details
    const memberUids = workspace.members.map((m) => m.uid);
    const users = await getUsersByUids(memberUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedMembers = workspace.members.map((m) => ({
        ...m.toObject(),
        user: userMap.get(m.uid) || { uid: m.uid },
    }));

    return { data: { ...workspace.toObject(), members: populatedMembers } };
};

export const updateWorkspaceService = async (id, uid, updates) => {
    const workspace = await Workspace.findById(id);

    if (!workspace) {
        return { error: "Workspace not found", status: 404 };
    }

    // Check if user is owner or admin
    const member = workspace.members.find((m) => m.uid === uid);
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { error: "Permission denied", status: 403 };
    }

    // Update allowed fields
    const allowedUpdates = ["name", "description", "status"];
    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            workspace[field] = updates[field];
        }
    });

    await workspace.save();

    return { data: workspace };
};

export const addMemberService = async (id, uid, memberUid, role = "member") => {
    const workspace = await Workspace.findById(id);

    if (!workspace) {
        return { error: "Workspace not found", status: 404 };
    }

    // Check permission
    const currentMember = workspace.members.find((m) => m.uid === uid);
    if (!currentMember || (currentMember.role !== "owner" && currentMember.role !== "admin")) {
        return { error: "Permission denied", status: 403 };
    }

    // Check if already a member
    if (workspace.members.some((m) => m.uid === memberUid)) {
        return { error: "User is already a member", status: 400 };
    }

    workspace.members.push({ uid: memberUid, role, joinedAt: new Date() });
    await workspace.save();

    return { data: workspace };
};

export const removeMemberService = async (id, uid, memberUid) => {
    const workspace = await Workspace.findById(id);

    if (!workspace) {
        return { error: "Workspace not found", status: 404 };
    }

    // Check permission
    const currentMember = workspace.members.find((m) => m.uid === uid);
    if (!currentMember || currentMember.role !== "owner") {
        return { error: "Only owner can remove members", status: 403 };
    }

    // Cannot remove owner
    if (memberUid === workspace.ownerUid) {
        return { error: "Cannot remove workspace owner", status: 400 };
    }

    workspace.members = workspace.members.filter((m) => m.uid !== memberUid);
    await workspace.save();

    return { data: workspace };
};
