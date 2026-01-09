import { useEffect, useState } from "react";
import {
    IoCheckmarkCircleOutline,
    IoTimeOutline,
    IoDocumentTextOutline,
    IoVideocamOutline,
    IoCalendarOutline,
    IoTrendingUpOutline,
    IoPersonOutline,
    IoAddOutline,
    IoArrowForwardOutline,
} from "react-icons/io5";
import { HiOutlineClipboardDocumentCheck, HiOutlineUsers, HiOutlineDocumentText, HiOutlineVideoCamera } from "react-icons/hi2";
import useWorkspaceStore from "../../store/useWorkspaceStore";
import useAuth from "../../hooks/useAuth";
import CreateTaskModal from "./CreateTaskModal";
import { formatClockTime } from "../../utils/formatTime";

const WorkspaceOverview = ({ workspace }) => {
    const { user } = useAuth();
    const {
        tasks,
        meetings,
        documents,
        fetchTasks,
        fetchMeetings,
        fetchDocuments,
    } = useWorkspaceStore();

    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    useEffect(() => {
        if (workspace?._id) {
            fetchTasks(workspace._id, { limit: 10 });
            fetchMeetings(workspace._id, { limit: 5, upcoming: 'true' });
        }
    }, [workspace?._id]);

    // Calculate stats
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const pendingTasks = tasks.filter((t) => t.status === "todo").length;
    const totalTasks = tasks.length;

    const upcomingMeetings = meetings.filter(
        (m) => new Date(m.startTime) > new Date() && m.status !== "cancelled"
    );

    // Get user's tasks
    const myTasks = tasks.filter((t) => t.assignedTo?.includes(user?.uid));
    const myUpcomingTasks = myTasks
        .filter((t) => t.dueDate && t.status !== "completed")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    // Get today's meetings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysMeetings = meetings.filter((m) => {
        const meetingDate = new Date(m.startTime);
        return meetingDate >= today && meetingDate < tomorrow && m.status !== "cancelled";
    });

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent":
                return "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
            case "high":
                return "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
            case "medium":
                return "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
            default:
                return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
            case "in_progress":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            case "review":
                return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
            default:
                return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400";
        }
    };

    const statsCards = [
        {
            label: "Completed",
            value: completedTasks,
            subtext: `of ${totalTasks} tasks`,
            icon: HiOutlineClipboardDocumentCheck,
            gradient: "from-violet-500 to-purple-600",
            progress: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
        },
        {
            label: "In Progress",
            value: inProgressTasks,
            subtext: `${pendingTasks} pending`,
            icon: IoTimeOutline,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "Documents",
            value: documents.length,
            subtext: "Shared files",
            icon: HiOutlineDocumentText,
            gradient: "from-emerald-500 to-teal-500",
        },
        {
            label: "Meetings",
            value: upcomingMeetings.length,
            subtext: `${todaysMeetings.length} today`,
            icon: HiOutlineVideoCamera,
            gradient: "from-fuchsia-500 to-pink-500",
        },
    ];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-4 lg:p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((stat, idx) => (
                        <div
                            key={idx}
                            className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${stat.gradient} p-4 text-white shadow-lg`}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                            <div className="relative">
                                <stat.icon className="w-6 h-6 mb-3 opacity-80" />
                                <p className="text-3xl font-bold">{stat.value}</p>
                                <p className="text-sm opacity-80 font-medium">{stat.label}</p>
                                <p className="text-xs opacity-60 mt-1">{stat.subtext}</p>
                                {stat.progress !== undefined && (
                                    <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white/70 rounded-full transition-all duration-500"
                                            style={{ width: `${stat.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* My Tasks Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <IoCalendarOutline className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">My Upcoming Tasks</h3>
                            </div>
                            <button
                                onClick={() => setIsCreateTaskModalOpen(true)}
                                className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 flex items-center justify-center transition-colors"
                            >
                                <IoAddOutline className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            </button>
                        </div>

                        <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                            {myUpcomingTasks.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <IoCheckmarkCircleOutline className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming tasks</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {myUpcomingTasks.map((task) => (
                                        <div
                                            key={task._id}
                                            className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                        {task.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-md ${getStatusBadge(task.status)}`}>
                                                            {task.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                        {formatDate(task.dueDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Today's Meetings Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="w-9 h-9 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
                                <IoVideocamOutline className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Today's Meetings</h3>
                        </div>

                        <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                            {todaysMeetings.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <IoVideocamOutline className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No meetings today</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {todaysMeetings.map((meeting) => (
                                        <div
                                            key={meeting._id}
                                            className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                                                        {meeting.title}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        {formatClockTime(meeting.startTime)} - {formatClockTime(meeting.endTime)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center -space-x-2">
                                                    {meeting.participantDetails?.slice(0, 3).map((p) => (
                                                        <div
                                                            key={p.uid}
                                                            className="w-7 h-7 rounded-full overflow-hidden bg-linear-to-br from-violet-500 to-purple-600 border-2 border-white dark:border-slate-800"
                                                            title={p.user?.name}
                                                        >
                                                            {p.user?.photoURL ? (
                                                                <img src={p.user.photoURL} alt={p.user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="flex items-center justify-center w-full h-full text-white text-xs font-medium">
                                                                    {p.user?.name?.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Team Members Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <HiOutlineUsers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Team Members</h3>
                            <span className="ml-auto text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                {workspace.members?.length || 0}
                            </span>
                        </div>

                        <div className="p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-2">
                                {workspace.members?.map((member) => (
                                    <div
                                        key={member.uid}
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                                    >
                                        <div className="w-9 h-9 rounded-full overflow-hidden bg-linear-to-br from-violet-500 to-purple-600 shrink-0">
                                            {member.user?.photoURL ? (
                                                <img src={member.user.photoURL} alt={member.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="flex items-center justify-center w-full h-full text-white text-sm font-medium">
                                                    {member.user?.name?.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                                {member.user?.name}
                                            </p>
                                            <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Documents Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <IoDocumentTextOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Recent Documents</h3>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            {documents.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <IoDocumentTextOutline className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No documents yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {documents.slice(0, 5).map((doc) => (
                                        <div
                                            key={doc._id}
                                            className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                    <IoDocumentTextOutline className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {doc.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        Updated {new Date(doc.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <IoArrowForwardOutline className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                workspace={workspace}
            />
        </div>
    );
};

export default WorkspaceOverview;
