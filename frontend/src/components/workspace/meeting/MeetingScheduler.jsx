/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
    IoVideocamOutline,
    IoTimeOutline,
    IoPlayOutline,
    IoTrashOutline,
    IoAddOutline,
    IoPeopleOutline,
    IoCalendarOutline,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import useAuth from "../../../hooks/useAuth";
import CreateMeetingModal from "./CreateMeetingModal";
import ConfirmModal from "../../common/ConfirmModal";
import { formatDateTime, formatDuration } from "../../../utils/formatTime";

const MeetingScheduler = ({ workspace }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { meetings, fetchMeetings, respondToMeeting, deleteMeeting } = useWorkspaceStore();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filter, setFilter] = useState("upcoming");
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, meetingId: null, isLoading: false });

    // Count live meetings
    const liveMeetingsCount = meetings.filter(m => m.status === "live").length;

    // Count upcoming meetings (scheduled status)
    const upcomingMeetingsCount = meetings.filter(m => m.status === "scheduled").length;

    // Auto-switch to "live" filter when there are live meetings and user just created one
    useEffect(() => {
        if (liveMeetingsCount > 0 && filter === "upcoming") {
            // Check if the latest meeting is live (likely just created)
            const latestMeeting = meetings[meetings.length - 1];
            if (latestMeeting?.status === "live") {
                setFilter("live");
            }
        }
    }, [liveMeetingsCount, meetings.length]);

    // Helper to get meeting end time (used for display purposes)
    const getMeetingEndTime = useCallback((meeting) => {
        if (!meeting) return null;
        if (meeting.endTime) return new Date(meeting.endTime);
        if (meeting.duration && meeting.startTime) {
            return new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60 * 1000);
        }
        return null;
    }, []);

    // Check for meeting ID in URL on mount
    useEffect(() => {
        const meetingId = searchParams.get("meeting");
        if (meetingId && workspace?._id) {
            navigate(`/home/workspace/${workspace._id}/meetings/${meetingId}`);
        }
    }, [searchParams, workspace?._id, navigate]);

    useEffect(() => {
        if (workspace?._id) {
            fetchMeetings(workspace._id, { forceRefresh: true });
        }
    }, [workspace?._id]);

    const filteredMeetings = meetings.filter((meeting) => {
        switch (filter) {
            case "upcoming":
                // Upcoming: only "scheduled" status
                return meeting.status === "scheduled";
            case "live":
                // Live: only "live" status
                return meeting.status === "live";
            case "past":
                // Past: only "completed" status
                return meeting.status === "completed";
            default:
                // All: show everything except cancelled
                return meeting.status !== "cancelled";
        }
    }).sort((a, b) => {
        // Live meetings first
        if (a.status === "live" && b.status !== "live") return -1;
        if (b.status === "live" && a.status !== "live") return 1;
        return new Date(a.startTime) - new Date(b.startTime);
    });

    const groupedMeetings = filteredMeetings.reduce((groups, meeting) => {
        // Group by "Live Now" for live meetings, otherwise by date
        const dateKey = meeting.status === "live" ? "Live Now" : new Date(meeting.startTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(meeting);
        return groups;
    }, {});

    const handleDeleteMeeting = (meetingId, e) => {
        e.stopPropagation();
        setDeleteConfirm({ isOpen: true, meetingId, isLoading: false });
    };

    const confirmDelete = async () => {
        setDeleteConfirm(prev => ({ ...prev, isLoading: true }));
        try {
            await deleteMeeting(deleteConfirm.meetingId);
            toast.success("Meeting deleted");
            setDeleteConfirm({ isOpen: false, meetingId: null, isLoading: false });
        } catch {
            toast.error("Failed to delete meeting");
            setDeleteConfirm(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleJoinMeeting = async (meeting) => {
        const userStatus = meeting.participants?.find((p) => p.uid === user?.uid)?.status;
        if (userStatus === "pending") {
            try {
                await respondToMeeting(meeting._id, "accepted");
            } catch {
                // Continue to join even if accept fails
            }
        }

        navigate(`/home/workspace/${workspace._id}/meetings/${meeting._id}`);
    };

    const canJoinMeeting = (meeting) => {
        // Can only join if meeting is live
        return meeting.status === "live";
    };

    const filters = [
        { key: "upcoming", label: "Upcoming", count: upcomingMeetingsCount },
        { key: "live", label: "Live", count: liveMeetingsCount },
        { key: "past", label: "Past" },
        { key: "all", label: "All" },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="sticky top-0 backdrop-blur-md  px-4 ">
                <div className="flex justify-between items-end border-b border-gray-100 dark:border-slate-900">
                    {/* Filters */}
                    <div className="flex gap-6">
                        {filters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`pb-3 pt-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${filter === f.key
                                    ? "border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                {f.label}
                                {f.count > 0 && (
                                    <span className={`w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center ${f.key === "live"
                                        ? "bg-green-500 animate-pulse"
                                        : "bg-violet-500"
                                        }`}>
                                        {f.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-all shadow-lg active:scale-95 cursor-pointer mb-2"
                    >
                        + <span className="hidden md:inline-block">New Meeting</span>
                    </button>
                </div>
            </div>

            {/* Meetings List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                {Object.keys(groupedMeetings).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-20 h-20 mb-4 bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                            <IoVideocamOutline className="w-10 h-10 text-violet-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                            No Meetings
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center max-w-xs">
                            {filter === "live" ? "No active meetings right now" : "Schedule your first team meeting"}
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
                        >
                            Create Meeting
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-8">
                        {/* Left sidebar info */}
                        <div className="hidden lg:block w-48 shrink-0">
                            <div className="sticky top-6 space-y-4">
                                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                                    Quick Stats
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <IoCalendarOutline className="w-4 h-4 text-violet-500" />
                                        <span>{filteredMeetings.length} {filter === "all" ? "total" : filter} meetings</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <IoPeopleOutline className="w-4 h-4 text-violet-500" />
                                        <span>{workspace?.members?.length || 0} team members</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                                        Schedule meetings, collaborate with your team, and track attendance all in one place.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Meetings content */}
                        <div className="flex-1 space-y-6">
                            {Object.entries(groupedMeetings).map(([date, dateMeetings]) => (
                                <div key={date}>
                                    <div className={`text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 ${date === "Live Now" ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
                                        }`}>
                                        {date === "Live Now" && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                                        {date}
                                    </div>

                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {dateMeetings.map((meeting) => (
                                                <MeetingCard
                                                    key={meeting._id}
                                                    meeting={meeting}
                                                    user={user}
                                                    canJoin={canJoinMeeting(meeting)}
                                                    onJoin={() => handleJoinMeeting(meeting)}
                                                    onDelete={(e) => handleDeleteMeeting(meeting._id, e)}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <CreateMeetingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspace={workspace}
            />

            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, meetingId: null, isLoading: false })}
                onConfirm={confirmDelete}
                title="Delete Meeting"
                message="Are you sure you want to delete this meeting? This action cannot be undone and all participants will be notified."
                confirmText="Delete"
                cancelText="Cancel"
                isDanger={true}
                isLoading={deleteConfirm.isLoading}
            />
        </div>
    );
};

// Meeting Card Component
const MeetingCard = ({ meeting, user, canJoin, onJoin, onDelete }) => {
    const isScheduler = meeting.scheduledBy === user?.uid;
    const isLive = meeting.status === "live";
    const isCompleted = meeting.status === "completed";

    const schedulerInfo = isScheduler
        ? { name: user?.displayName || user?.name, photoURL: user?.photoURL }
        : (meeting.scheduledByUser ||
            meeting.participantDetails?.find(p => p.uid === meeting.scheduledBy)?.user ||
            { name: "Unknown", photoURL: null });



    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group/card relative bg-white dark:bg-slate-800 border rounded-2xl px-5 py-3 transition-all duration-500 hover:shadow-lg dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 ${isLive
                ? "border-green-300 dark:border-green-600 shadow-green-100 dark:shadow-green-900/20"
                : isCompleted
                    ? "border-gray-300 dark:border-slate-600 opacity-75"
                    : "border-gray-200 dark:border-slate-700"
                }`}
        >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-8 -mt-8 ${isLive
                    ? "bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                    : isCompleted
                        ? "bg-linear-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20"
                        : "bg-linear-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20"
                    }`} />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                        {/* Organizer Avatar */}
                        <div className="relative shrink-0">
                            {schedulerInfo?.photoURL ? (
                                <img
                                    src={schedulerInfo.photoURL}
                                    alt={schedulerInfo.name}
                                    className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-slate-700">
                                    {schedulerInfo?.name?.charAt(0) || "?"}
                                </div>
                            )}
                            {isLive && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-tight flex items-center gap-2">
                                {meeting.title}
                                {isLive && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-green-500 rounded-full uppercase">
                                        Live
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                                    {isScheduler ? "You" : schedulerInfo?.name || "Unknown"}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                    {isScheduler ? "(Organizer)" : "• Organizer"}
                                </span>

                            </div>
                        </div>
                    </div>

                    {/* Delete button for organizer */}
                    {isScheduler && (
                        <button
                            onClick={onDelete}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all opacity-0 group-hover/card:opacity-100"
                        >
                            <IoTrashOutline className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Description */}
                {meeting.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                        {meeting.description}
                    </p>
                )}

                {/* Time & Details */}
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                    {/* Start & End Time */}
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700/50 px-2.5 py-1.5 rounded-lg">
                        <IoTimeOutline className="w-3.5 h-3.5 text-violet-500" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {formatDateTime(meeting.startTime)}
                        </span>
                        {(meeting.endTime || meeting.duration) && (
                            <>
                                <span className="text-gray-400 dark:text-gray-500">→</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {meeting.endTime
                                        ? formatDateTime(meeting.endTime)
                                        : formatDateTime(new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000))
                                    }
                                </span>
                            </>
                        )}
                    </div>

                    {/* Duration */}
                    {meeting.duration && (
                        <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1.5 rounded-lg">
                            <IoCalendarOutline className="w-3.5 h-3.5 text-violet-500" />
                            <span className="font-medium text-violet-600 dark:text-violet-400">
                                {formatDuration(meeting.duration)}
                            </span>
                        </div>
                    )}




                </div>

                {/* Footer - Participants & Join */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                    {/* Participants */}
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                            {meeting.participantDetails?.filter(p => p.uid !== meeting.scheduledBy).slice(0, 5).map((p) => (
                                <div
                                    key={p.uid}
                                    className={`w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 ${p.status === "accepted" ? "ring-1 ring-green-400/50" : ""
                                        }`}
                                    title={`${p.user?.name} (${p.status})`}
                                >
                                    {p.user?.photoURL ? (
                                        <img src={p.user.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-medium">
                                            {p.user?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {meeting.participantDetails?.length > 5 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-semibold text-gray-600 dark:text-gray-300">
                                    +{meeting.participantDetails.length - 5}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Join Button - only show if not completed/expired */}
                    {(canJoin || isLive) && !isCompleted && (
                        <button
                            onClick={onJoin}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-full transition-all active:scale-95 ${isLive
                                ? "bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/25"
                                : "bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/25"
                                }`}
                        >
                            <IoPlayOutline className="w-3.5 h-3.5" />
                            Join
                        </button>
                    )}

                    {/* Completed badge for past meetings */}
                    {isCompleted && (
                        <span className="px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 rounded-full">
                            Ended
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MeetingScheduler;
