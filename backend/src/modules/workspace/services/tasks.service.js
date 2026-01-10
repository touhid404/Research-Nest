import Task from "../../../models/task.model.js";
import Workspace from "../../../models/workspace.model.js";
import { getUsersByUids } from "./workspace.service.js";

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
