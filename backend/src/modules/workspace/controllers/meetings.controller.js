import {
    createMeetingService,
    getMeetingsService,
    getMyMeetingsService,
    updateMeetingService,
    respondToMeetingService,
    deleteMeetingService,
} from "../services/meetings.service.js";
import Notification from "../../../models/notification.model.js";
import User from "../../../models/user.model.js";
import Workspace from "../../../models/workspace.model.js";

// ============== MEETING CONTROLLERS ==============

export const createMeeting = async (req, res) => {
    try {
        const uid = req.user.uid;
        const {
            workspaceId, title, description, startTime, endTime,
            participants, type, isRecurring, recurrencePattern, externalLink,
            isInstant, duration
        } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        // For non-instant meetings, startTime is required
        if (!isInstant && !startTime) {
            return res.status(400).json({ success: false, message: "Start time is required for scheduled meetings" });
        }

        const result = await createMeetingService({
            uid,
            workspaceId,
            title,
            description,
            startTime,
            endTime,
            participants,
            type,
            isRecurring,
            recurrencePattern,
            externalLink,
            isInstant,
            duration,
        });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("meeting:created", result.data);
        }

        // --- Notification Logic: Meeting Scheduled/Started ---
        const workspace = await Workspace.findById(workspaceId);
        if (workspace) {
            // Notify all workspace members (excluding creator)
            const memberUids = (workspace.members || []).map(m => m.uid);
            const allMemberUids = new Set([...memberUids, ...(workspace.admins || []), workspace.ownerUid]);
            allMemberUids.delete(uid); // Remove creator

            const recipients = await User.find({ uid: { $in: Array.from(allMemberUids) } });
            const senderUser = await User.findOne({ uid });

            const type = isInstant ? 'meeting_started' : 'meeting_scheduled';
            const action = isInstant ? 'started' : 'scheduled';

            for (const recipient of recipients) {
                await Notification.create({
                    recipient: recipient._id,
                    sender: senderUser._id,
                    type: type,
                    message: `${action} a meeting in "**${workspace.name}**"`,
                    relatedId: result.data._id,
                    relatedModel: 'Meeting',
                    isRead: false
                });
            }
        }

        res.status(201).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ success: false, message: "Failed to create meeting" });
    }
};

export const getMeetings = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { workspaceId } = req.params;
        const { startDate, endDate, status, limit, upcoming } = req.query;

        const result = await getMeetingsService(uid, workspaceId, {
            startDate,
            endDate,
            status,
            limit,
            upcoming,
        });

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch meetings" });
    }
};

export const getMyMeetings = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { startDate, endDate } = req.query;

        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const result = await getMyMeetingsService(uid, { startDate, endDate });

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error fetching user meetings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch meetings" });
    }
};

export const updateMeeting = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { id } = req.params;

        const result = await updateMeetingService(id, uid, req.body);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("meeting:updated", result.data);
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error updating meeting:", error);
        res.status(500).json({ success: false, message: "Failed to update meeting" });
    }
};

export const respondToMeeting = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { id } = req.params;
        const { status } = req.body;

        const result = await respondToMeetingService(id, uid, status);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error responding to meeting:", error);
        res.status(500).json({ success: false, message: "Failed to respond to meeting" });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const uid = req.user.uid;
        const { id } = req.params;

        const result = await deleteMeetingService(id, uid);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(`workspace:${result.workspaceId}`).emit("meeting:deleted", { meetingId: id });
        }

        res.status(200).json({ success: true, message: "Meeting deleted" });
    } catch (error) {
        console.error("Error deleting meeting:", error);
        res.status(500).json({ success: false, message: "Failed to delete meeting" });
    }
};
