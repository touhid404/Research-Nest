import { useEffect, useState, useMemo } from "react";
import {
    IoCheckmarkCircleOutline,
    IoTimeOutline,
    IoDocumentTextOutline,
    IoVideocamOutline,
    IoCalendarOutline,
    IoTrendingUpOutline,
    IoArrowForwardOutline,
    IoEllipseOutline,
    IoChevronForwardOutline,
} from "react-icons/io5";
import { HiOutlineClipboardDocumentCheck, HiOutlineUsers, HiOutlineDocumentText, HiOutlineVideoCamera, HiOutlineChartBar } from "react-icons/hi2";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useWorkspaceStore from "../../store/useWorkspaceStore";
import useAuth from "../../hooks/useAuth";
import { formatClockTime } from "../../utils/formatTime";
import WorkspaceLoader from "../loader/WorkspaceLoader";

const WorkspaceOverview = ({ workspace }) => {
    const { user } = useAuth();
    const {
        tasks,
        meetings,
        documents,
        fetchTasks,
        fetchMeetings,
        fetchDocuments,
        loadingTasks,
        loadingMeetings,
        loadingDocuments
    } = useWorkspaceStore();


    useEffect(() => {
        if (workspace?._id) {
            fetchTasks(workspace._id, { limit: 50 });
            fetchMeetings(workspace._id, { limit: 10, upcoming: 'true' });
            fetchDocuments(workspace._id);
        }
    }, [workspace?._id]);

    // Generate chart data for last 7 days - must be before early return
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            // Count tasks completed on this day
            const completed = tasks.filter((t) => {
                if (t.status !== "completed" || !t.updatedAt) return false;
                const updated = new Date(t.updatedAt);
                return updated >= date && updated < nextDate;
            }).length;

            // Count tasks created on this day
            const created = tasks.filter((t) => {
                if (!t.createdAt) return false;
                const createdDate = new Date(t.createdAt);
                return createdDate >= date && createdDate < nextDate;
            }).length;

            data.push({
                name: dayName,
                completed,
                created,
            });
        }
        return data;
    }, [tasks]);

    const isInitialLoading = (loadingTasks && tasks.length === 0) ||
        (loadingMeetings && meetings.length === 0) ||
        (loadingDocuments && documents.length === 0);

    if (isInitialLoading) {
        return <WorkspaceLoader />;
    }

    // Calculate stats
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const pendingTasks = tasks.filter((t) => t.status === "todo").length;
    const reviewTasks = tasks.filter((t) => t.status === "review").length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Priority breakdown
    const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
    const highTasks = tasks.filter((t) => t.priority === "high" && t.status !== "completed").length;

    const upcomingMeetings = meetings.filter(
        (m) => new Date(m.startTime) > new Date() && m.status !== "cancelled"
    );

    // Get user's tasks
    const myTasks = tasks.filter((t) => t.assignedTo?.includes(user?.uid));
    const myUpcomingTasks = myTasks
        .filter((t) => t.dueDate && t.status !== "completed")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    // Get overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter((t) => {
        if (!t.dueDate || t.status === "completed") return false;
        return new Date(t.dueDate) < now;
    }).length;

    // Get today's meetings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysMeetings = meetings.filter((m) => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= today && meetingDate < tomorrow && m.status !== "cancelled";
    });

    // This week's stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const thisWeekCompleted = tasks.filter((t) => {
        if (t.status !== "completed" || !t.updatedAt) return false;
        const updated = new Date(t.updatedAt);
        return updated >= weekStart && updated < weekEnd;
    }).length;

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays < 0) return "Overdue";
        if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const formatDateColor = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "text-red-500";
        if (diffDays === 0) return "text-amber-500";
        return "text-slate-500 dark:text-slate-400";
    };

    const getPriorityDot = (priority) => {
        switch (priority) {
            case "urgent": return "bg-red-500";
            case "high": return "bg-orange-500";
            case "medium": return "bg-amber-500";
            default: return "bg-emerald-500";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />;
            case "in_progress":
                return <IoTimeOutline className="w-4 h-4 text-blue-500" />;
            default:
                return <IoEllipseOutline className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-4 lg:p-6 space-y-4  mx-auto">

                {/* Header with Quick Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Analytics Cards - Minimal Style */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Completion Rate */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Completion</span>
                            <HiOutlineChartBar className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{completionRate}%</span>
                            <span className="text-xs text-slate-400 mb-1">{completedTasks}/{totalTasks}</span>
                        </div>
                        <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">In Progress</span>
                            <IoTimeOutline className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{inProgressTasks}</span>
                            <span className="text-xs text-slate-400 mb-1">tasks</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                {pendingTasks} pending
                            </span>
                            {reviewTasks > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    {reviewTasks} review
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Overdue / Urgent */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Attention</span>
                            {overdueTasks > 0 ? (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            ) : (
                                <IoCheckmarkCircleOutline className="w-4 h-4 text-emerald-500" />
                            )}
                        </div>
                        <div className="flex items-end gap-2">
                            <span className={`text-2xl font-bold ${overdueTasks > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                {overdueTasks}
                            </span>
                            <span className="text-xs text-slate-400 mb-1">overdue</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            {urgentTasks > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    {urgentTasks} urgent
                                </span>
                            )}
                            {highTasks > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                    {highTasks} high
                                </span>
                            )}
                            {urgentTasks === 0 && highTasks === 0 && (
                                <span className="text-emerald-500">All good!</span>
                            )}
                        </div>
                    </div>

                    {/* Meetings */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Meetings</span>
                            <IoVideocamOutline className="w-4 h-4 text-violet-500" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{todaysMeetings.length}</span>
                            <span className="text-xs text-slate-400 mb-1">today</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                            {upcomingMeetings.length} upcoming this week
                        </div>
                    </div>
                </div>

                {/* Task Activity Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Task Activity</span>
                            <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-500">Completed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <span className="text-slate-500">Created</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#e2e8f0'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="created"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    fill="url(#createdGradient)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#completedGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-4">
                    {/* My Tasks Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <HiOutlineClipboardDocumentCheck className="w-4 h-4 text-slate-400" />
                                <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200">My Tasks</h3>
                            </div>
                            <span className="text-xs text-slate-400">{myUpcomingTasks.length} upcoming</span>
                        </div>

                        <div className="max-h-[280px] overflow-y-auto">
                            {myUpcomingTasks.length === 0 ? (
                                <div className="py-10 text-center">
                                    <IoCheckmarkCircleOutline className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-400">No upcoming tasks</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {myUpcomingTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group flex items-center gap-3"
                                        >
                                            {getStatusIcon(task.status)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(task.priority)}`} />
                                                    <span className="text-xs text-slate-400 capitalize">{task.priority}</span>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-medium ${formatDateColor(task.dueDate)}`}>
                                                {formatDate(task.dueDate)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today's Meetings Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <IoVideocamOutline className="w-4 h-4 text-slate-400" />
                                <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200">Today's Schedule</h3>
                            </div>
                            <span className="text-xs text-slate-400">{todaysMeetings.length} meetings</span>
                        </div>

                        <div className="max-h-[280px] overflow-y-auto">
                            {todaysMeetings.length === 0 ? (
                                <div className="py-10 text-center">
                                    <IoCalendarOutline className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-400">No meetings today</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {todaysMeetings.map((meeting) => (
                                        <div
                                            key={meeting._id}
                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="text-center shrink-0 pt-0.5">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                        {formatClockTime(meeting.startTime)}
                                                    </p>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                                        {meeting.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex -space-x-1.5">
                                                            {meeting.participantDetails?.slice(0, 3).map((p) => (
                                                                <div
                                                                    key={p.uid}
                                                                    className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 border border-white dark:border-slate-800"
                                                                    title={p.user?.name}
                                                                >
                                                                    {p.user?.photoURL ? (
                                                                        <img src={p.user.photoURL} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="flex items-center justify-center w-full h-full text-[9px] text-slate-500 font-medium">
                                                                            {p.user?.name?.charAt(0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {meeting.participantDetails?.length > 3 && (
                                                            <span className="text-xs text-slate-400">+{meeting.participantDetails.length - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Team Members Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <HiOutlineUsers className="w-4 h-4 text-slate-400" />
                                <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200">Team</h3>
                            </div>
                            <span className="text-xs text-slate-400">{workspace.members?.length || 0} members</span>
                        </div>

                        <div className="p-3 max-h-[200px] overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {workspace.members?.map((member) => (
                                    <div
                                        key={member.uid}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600 shrink-0">
                                            {member.user?.photoURL ? (
                                                <img src={member.user.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full text-xs text-slate-500 font-medium">
                                                    {member.user?.name?.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {member.user?.name?.split(' ')[0]}
                                        </span>
                                        {member.role === 'owner' && (
                                            <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Documents Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <HiOutlineDocumentText className="w-4 h-4 text-slate-400" />
                                <h3 className="font-medium text-sm text-slate-700 dark:text-slate-200">Documents</h3>
                            </div>
                            <span className="text-xs text-slate-400">{documents.length} files</span>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto">
                            {documents.length === 0 ? (
                                <div className="py-10 text-center">
                                    <IoDocumentTextOutline className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-400">No documents yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {documents.slice(0, 5).map((doc) => (
                                        <div
                                            key={doc._id}
                                            className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                <IoDocumentTextOutline className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                                                    {doc.title}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(doc.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <IoChevronForwardOutline className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
        </div>
    );
};

export default WorkspaceOverview;
