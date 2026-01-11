import Meeting from "../../../models/meeting.model.js";
import Workspace from "../../../models/workspace.model.js";
import { getUsersByUids } from "./workspace.service.js";

// ============== MEETING SERVICES ==============

export const createMeetingService = async ({
    uid, workspaceId, title, description, startTime, endTime,
    participants, isInstant, duration
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
    // If duration is null/undefined, endTime stays null (no end time)
    let meetingEndTime = null;
    if (endTime) {
        meetingEndTime = new Date(endTime);
    } else if (duration && duration > 0) {
        meetingEndTime = new Date(meetingStartTime.getTime() + duration * 60000);
    }
    // If duration is null/0/undefined and no endTime, meetingEndTime stays null (infinite meeting)

    const meeting = new Meeting({
        workspaceId,
        title: title || (isInstant ? "Instant Meeting" : "Untitled Meeting"),
        description: description || "",
        scheduledBy: uid,
        participants: meetingParticipants,
        startTime: meetingStartTime,
        endTime: meetingEndTime,
        duration: duration || null,
        isInstant: isInstant || false,
        status: isInstant ? "live" : "scheduled",
    });

    await meeting.save();

    // Populate scheduler user details for the response
    const schedulerUsers = await getUsersByUids([uid]);
    const scheduledByUser = schedulerUsers[0] || { uid };

    // Get participant details
    const participantUids = meetingParticipants.map(p => p.uid);
    const participantUsers = await getUsersByUids(participantUids);
    const userMap = new Map(participantUsers.map((u) => [u.uid, u]));

    const populatedMeeting = {
        ...meeting.toObject(),
        scheduledByUser,
        participantDetails: meetingParticipants.map((p) => ({
            ...p,
            user: userMap.get(p.uid) || { uid: p.uid },
        })),
    };

    return { data: populatedMeeting, workspaceId };
};

export const getMeetingsService = async (uid, workspaceId, filters) => {
    const { startDate, endDate, status, limit, upcoming } = filters;

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some((m) => m.uid === uid)) {
        return { error: "Workspace access denied", status: 403 };
    }

    // Auto-complete expired live meetings
    const now = new Date();
    await Meeting.updateMany(
        {
            workspaceId,
            status: "live",
            $or: [
                { endTime: { $lte: now } },
                {
                    endTime: null,
                    duration: { $ne: null },
                    $expr: {
                        $lte: [
                            { $add: ["$startTime", { $multiply: ["$duration", 60000] }] },
                            now
                        ]
                    }
                }
            ]
        },
        { $set: { status: "completed" } }
    );

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

    // Get participant details AND scheduler details
    const allUids = [...new Set([
        ...meetings.flatMap((m) => m.participants.map((p) => p.uid)),
        ...meetings.map((m) => m.scheduledBy)
    ])];
    const users = await getUsersByUids(allUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedMeetings = meetings.map((meeting) => ({
        ...meeting.toObject(),
        scheduledByUser: userMap.get(meeting.scheduledBy) || { uid: meeting.scheduledBy },
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

    // Populate scheduler user details
    const schedulerUids = [...new Set(meetings.map((m) => m.scheduledBy))];
    const users = await getUsersByUids(schedulerUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedMeetings = meetings.map((meeting) => ({
        ...meeting.toObject(),
        scheduledByUser: userMap.get(meeting.scheduledBy) || { uid: meeting.scheduledBy },
    }));

    return { data: populatedMeetings };
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
        ? ["title", "description", "startTime", "endTime", "status"]
        : [];

    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            meeting[field] = updates[field];
        }
    });

    await meeting.save();

    // Populate user details for the response (matching getMeetingsService format)
    const allUids = [...new Set([
        ...meeting.participants.map((p) => p.uid),
        meeting.scheduledBy
    ])];
    const users = await getUsersByUids(allUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedMeeting = {
        ...meeting.toObject(),
        scheduledByUser: userMap.get(meeting.scheduledBy) || { uid: meeting.scheduledBy },
        participantDetails: meeting.participants.map((p) => ({
            ...p.toObject(),
            user: userMap.get(p.uid) || { uid: p.uid },
        })),
    };

    return { data: populatedMeeting, workspaceId: meeting.workspaceId };
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

    // Populate user details for the response
    const allUids = [...new Set([
        ...meeting.participants.map((p) => p.uid),
        meeting.scheduledBy
    ])];
    const users = await getUsersByUids(allUids);
    const userMap = new Map(users.map((u) => [u.uid, u]));

    const populatedMeeting = {
        ...meeting.toObject(),
        scheduledByUser: userMap.get(meeting.scheduledBy) || { uid: meeting.scheduledBy },
        participantDetails: meeting.participants.map((p) => ({
            ...p.toObject(),
            user: userMap.get(p.uid) || { uid: p.uid },
        })),
    };

    return { data: populatedMeeting };
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
