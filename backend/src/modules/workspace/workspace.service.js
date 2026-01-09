import Workspace from "../../models/workspace.model.js";
import Task from "../../models/task.model.js";
import Meeting from "../../models/meeting.model.js";
import Document from "../../models/document.model.js";
import User from "../../models/user.model.js";

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

// ============== TASK SERVICES ==============

export const createTaskService = async ({ uid, workspaceId, title, description, assignedTo, dueDate, startDate, priority, labels }) => {
    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Workspace access denied", status: 403 };
    }

    const task = new Task({
        workspaceId,
        title,
        description: description || "",
        assignedTo: assignedTo || [],
        createdBy: uid,
        dueDate: dueDate || null,
        startDate: startDate || null,
        priority: priority || "medium",
        labels: labels || [],
    });

    await task.save();

    return { data: task, workspaceId };
};

export const getTasksService = async (uid, workspaceId, filters) => {
    const { status, assignedTo, startDate, endDate, limit, upcoming } = filters;

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Workspace access denied", status: 403 };
    }

    const query = { workspaceId };

    // Support array of statuses
    if (status) {
        query.status = Array.isArray(status) ? { $in: status } : status;
    }
    if (assignedTo) query.assignedTo = assignedTo;

    // Date range filter for calendar view
    if (startDate || endDate) {
        query.dueDate = {};
        if (startDate) query.dueDate.$gte = new Date(startDate);
        if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    let taskQuery = Task.find(query).sort({ dueDate: 1, priority: -1 });

    // Apply limit if provided
    if (limit) {
        taskQuery = taskQuery.limit(parseInt(limit));
    }

    const tasks = await taskQuery;

    // Get assignee details
    const assigneeUids = [...new Set(tasks.flatMap((t) => t.assignedTo))];
    const users = await getUsersByUids(assigneeUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedTasks = tasks.map((task) => ({
        ...task.toObject(),
        assignedToUsers: task.assignedTo.map((uid) => userMap.get(uid) || { uid }),
    }));

    return { data: populatedTasks };
};

export const getMyTasksService = async (uid, filters) => {
    const { startDate, endDate, status } = filters;

    const query = { assignedTo: uid };

    if (status) query.status = status;

    if (startDate || endDate) {
        query.dueDate = {};
        if (startDate) query.dueDate.$gte = new Date(startDate);
        if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 }).populate("workspaceId", "name");

    return { data: tasks };
};

export const updateTaskService = async (id, uid, updates) => {
    const task = await Task.findById(id);

    if (!task) {
        return { error: "Task not found", status: 404 };
    }

    // Verify workspace access
    const workspace = await Workspace.findById(task.workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Access denied", status: 403 };
    }

    // Update allowed fields
    const allowedUpdates = [
        "title", "description", "assignedTo", "status", "priority",
        "dueDate", "startDate", "labels", "checklist", "estimatedHours"
    ];

    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            task[field] = updates[field];
        }
    });

    // Set completedAt if status changed to completed
    if (updates.status === "completed" && !task.completedAt) {
        task.completedAt = new Date();
    } else if (updates.status && updates.status !== "completed") {
        task.completedAt = null;
    }

    await task.save();

    return { data: task, workspaceId: task.workspaceId };
};

export const deleteTaskService = async (id, uid) => {
    const task = await Task.findById(id);

    if (!task) {
        return { error: "Task not found", status: 404 };
    }

    // Verify workspace access
    const workspace = await Workspace.findById(task.workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Access denied", status: 403 };
    }

    const workspaceId = task.workspaceId;
    await task.deleteOne();

    return { data: { taskId: id }, workspaceId };
};

// ============== MEETING SERVICES ==============

export const createMeetingService = async ({
    uid, workspaceId, title, description, startTime, endTime,
    participants, type, isRecurring, recurrencePattern, externalLink,
    isInstant, duration
}) => {
    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Workspace access denied", status: 403 };
    }

    // Prepare participants (add scheduler as accepted)
    const meetingParticipants = [{ uid, status: "accepted" }];
    if (participants && Array.isArray(participants)) {
        participants.forEach((pUid) => {
            if (pUid !== uid) {
                meetingParticipants.push({ uid: pUid, status: "pending" });
            }
        });
    }

    // Handle instant meeting - start immediately
    const meetingStartTime = isInstant ? new Date() : new Date(startTime);
    
    // Calculate endTime if duration is provided but endTime is not
    let meetingEndTime = null;
    if (endTime) {
        meetingEndTime = new Date(endTime);
    } else if (duration) {
        meetingEndTime = new Date(meetingStartTime.getTime() + duration * 60000);
    }

    const meeting = new Meeting({
        workspaceId,
        title: title || (isInstant ? "Instant Meeting" : "Untitled Meeting"),
        description: description || "",
        scheduledBy: uid,
        participants: meetingParticipants,
        startTime: meetingStartTime,
        endTime: meetingEndTime,
        duration: duration || null,
        type: type || "video",
        isInstant: isInstant || false,
        status: isInstant ? "live" : "scheduled",
        isRecurring: isRecurring || false,
        recurrencePattern: recurrencePattern || null,
        externalLink: externalLink || null,
    });

    await meeting.save();

    return { data: meeting, workspaceId };
};

export const getMeetingsService = async (uid, workspaceId, filters) => {
    const { startDate, endDate, status, limit, upcoming } = filters;

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Workspace access denied", status: 403 };
    }

    const query = { workspaceId };

    if (status) query.status = status;

    // If upcoming filter is true, only get future meetings
    if (upcoming === 'true') {
        query.startTime = { $gte: new Date() };
        query.status = { $ne: 'cancelled' };
    } else if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
    }

    let meetingQuery = Meeting.find(query).sort({ startTime: 1 });

    // Apply limit if provided
    if (limit) {
        meetingQuery = meetingQuery.limit(parseInt(limit));
    }

    const meetings = await meetingQuery;

    // Get participant details
    const participantUids = [...new Set(meetings.flatMap((m) => m.participants.map((p) => p.uid)))];
    const users = await getUsersByUids(participantUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedMeetings = meetings.map((meeting) => ({
        ...meeting.toObject(),
        participantDetails: meeting.participants.map((p) => ({
            ...p.toObject(),
            user: userMap.get(p.uid) || { uid: p.uid },
        })),
    }));

    return { data: populatedMeetings };
};

export const getMyMeetingsService = async (uid, filters) => {
    const { startDate, endDate } = filters;

    const query = {
        "participants.uid": uid,
        status: { $ne: "cancelled" },
    };

    if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const meetings = await Meeting.find(query)
        .sort({ startTime: 1 })
        .populate("workspaceId", "name");

    return { data: meetings };
};

export const updateMeetingService = async (id, uid, updates) => {
    const meeting = await Meeting.findById(id);

    if (!meeting) {
        return { error: "Meeting not found", status: 404 };
    }

    // Verify workspace access
    const workspace = await Workspace.findById(meeting.workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Access denied", status: 403 };
    }

    // Only scheduler can update meeting details
    const allowedUpdates = meeting.scheduledBy === uid
        ? ["title", "description", "startTime", "endTime", "type", "status", "externalLink", "notes"]
        : ["notes"];

    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            meeting[field] = updates[field];
        }
    });

    await meeting.save();

    return { data: meeting, workspaceId: meeting.workspaceId };
};

export const respondToMeetingService = async (id, uid, status) => {
    const meeting = await Meeting.findById(id);

    if (!meeting) {
        return { error: "Meeting not found", status: 404 };
    }

    const participant = meeting.participants.find((p) => p.uid === uid);
    if (!participant) {
        return { error: "Not invited to this meeting", status: 403 };
    }

    participant.status = status;
    await meeting.save();

    return { data: meeting };
};

export const deleteMeetingService = async (id, uid) => {
    const meeting = await Meeting.findById(id);

    if (!meeting) {
        return { error: "Meeting not found", status: 404 };
    }

    // Only scheduler can delete
    if (meeting.scheduledBy !== uid) {
        return { error: "Only scheduler can delete meeting", status: 403 };
    }

    const workspaceId = meeting.workspaceId;
    await meeting.deleteOne();

    return { data: { meetingId: id }, workspaceId };
};

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
