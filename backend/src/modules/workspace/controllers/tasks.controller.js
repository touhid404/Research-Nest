import {
    createTaskService,
    getTasksService,
    getMyTasksService,
    updateTaskService,
    deleteTaskService,
} from "../services/tasks.service.js";
import Notification from "../../../models/notification.model.js";
import User from "../../../models/user.model.js";
import Workspace from "../../../models/workspace.model.js";

// ============== TASK CONTROLLERS ==============

export const createTask = async (req, res) => {
    try {
        const uid = req.user.uid;
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

        // --- Notification Logic: Task Assigned ---
        if (assignedTo && assignedTo.length > 0) {
            const workspace = await Workspace.findById(workspaceId);
            if (workspace) {
                // assignedTo is array of uids
                // Filter out the creator if they assigned themselves
                const targetUids = assignedTo.filter(id => id !== uid);

                if (targetUids.length > 0) {
                    const senderUser = await User.findOne({ uid });
                    const recipients = await User.find({ uid: { $in: targetUids } });

                    for (const recipient of recipients) {
                        await Notification.create({
                            recipient: recipient._id,
                            sender: senderUser._id,
                            type: 'task_assigned',
                            message: JSON.stringify({ text: `assigned you a new task in workspace "**${workspace.name}**"`, workspaceId: workspaceId }),
                            relatedId: result.data._id, // Task ID
                            relatedModel: 'Task', // Assuming Task model name, though schema isn't strictly defined for 'relatedModel' yet, using string is fine
                            isRead: false
                        });
                    }
                }
            }
        }

        res.status(201).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ success: false, message: "Failed to create task" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const uid = req.user.uid;
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
        const uid = req.user.uid;
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
        const uid = req.user.uid;
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
        const uid = req.user.uid;
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
