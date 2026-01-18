import { useState, useEffect, useMemo } from "react";
import {
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoAddOutline,
    IoCheckmarkCircle,
    IoEllipseOutline,
    IoAlertCircleOutline,
    IoTimeOutline,
    IoFlagOutline,
} from "react-icons/io5";
import useWorkspaceStore from "../../../store/useWorkspaceStore";
import useAuth from "../../../hooks/useAuth";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";

const TaskCalendar = ({ workspace }) => {
    const { user } = useAuth();
    const { tasks, fetchTasks, updateTask } = useWorkspaceStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (workspace?._id) {
            // Fetch tasks for the current month range (with some buffer for multi-day tasks)
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

            fetchTasks(workspace._id, {
                startDate: startOfMonth.toISOString(),
                endDate: endOfMonth.toISOString(),
                forceRefresh: true
            });
        }
    }, [workspace?._id, currentDate.getMonth(), currentDate.getFullYear()]);

    // Role-based filtering
    const filteredTasks = useMemo(() => {
        if (!tasks || !user || !workspace) return [];

        const member = workspace.members.find(m => m.uid === user.uid);
        const isOwnerOrAdmin = member && (member.role === 'owner' || member.role === 'admin');

        if (isOwnerOrAdmin) return tasks;

        return tasks.filter(task =>
            (task.assignedTo && task.assignedTo.includes(user.uid)) ||
            task.createdBy === user.uid
        );
    }, [tasks, user, workspace]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days = [];

        // Previous month's days
        const prevMonth = new Date(year, month, 0);
        const prevMonthDays = prevMonth.getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false,
            });
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month's days to fill the grid
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    }, [currentDate]);

    // Get task bars that span multiple days (Jira-style)
    const getTaskBarsForWeek = useMemo(() => {
        const taskBars = [];

        filteredTasks.forEach((task) => {
            if (!task.startDate && !task.dueDate) return;

            const startDate = task.startDate ? new Date(task.startDate) : new Date(task.dueDate);
            const endDate = task.dueDate ? new Date(task.dueDate) : new Date(task.startDate);

            // Normalize dates to start of day
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            taskBars.push({
                ...task,
                startDate,
                endDate,
            });
        });

        return taskBars;
    }, [filteredTasks]);

    // Get tasks that START on a specific date (not spanning, just start date)
    const getTasksStartingOnDate = (date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        return getTaskBarsForWeek.filter((task) => {
            return task.startDate.toDateString() === dayStart.toDateString();
        });
    };

    // Get all tasks spanning a date (for the detail panel)
    const getTasksSpanningDate = (date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return getTaskBarsForWeek.filter((task) => {
            return task.startDate <= dayEnd && task.endDate >= dayStart;
        });
    };

    // Get task bar info for rendering
    const getTaskBarInfo = (task, date, dayIndex) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const isStart = task.startDate.toDateString() === dayStart.toDateString();
        const isEnd = task.endDate.toDateString() === dayStart.toDateString();
        const isWeekStart = dayIndex % 7 === 0;
        const isWeekEnd = dayIndex % 7 === 6;

        // Calculate if this continues from previous week or to next week
        const continuesFromPrev = !isStart && isWeekStart;
        const continuesToNext = !isEnd && isWeekEnd;

        return { isStart, isEnd, continuesFromPrev, continuesToNext };
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    const handleToggleTaskStatus = async (task, e) => {
        e.stopPropagation();

        // Members check handled in backend, but visually we can prevent instant toggle if we wanted
        // For now let backend handle permissions
        try {
            const newStatus = task.status === "completed" ? "todo" : "completed";
            await updateTask(task._id, { status: newStatus });
        } catch (error) {
            console.error("Failed to update task status", error);
        }
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Helper to generate a short "key" for the task (like Jira)
    const getTaskKey = (task) => {
        // Use first 3 chars of title uppercase + last 3 of ID
        return (task.title.substring(0, 3).toUpperCase() + "-" + task._id.substring(task._id.length - 3)).replace(/\s/g, '');
    };

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex-none flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h2>
                    <div className="flex items-center">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <IoChevronBackOutline className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <IoChevronForwardOutline className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                    >
                        <IoAddOutline className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Task</span>
                    </button>
                </div>
            </div>

            {/* Calendar Grid - Flexible height */}
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                {/* Week Days Header */}
                <div className="flex-none grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid - Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 auto-rows-fr h-full min-h-[600px]">
                        {calendarDays.map((day, index) => {
                            const startingTasks = getTasksStartingOnDate(day.date);
                            const allSpanningTasks = getTasksSpanningDate(day.date);
                            const isSelected =
                                selectedDate &&
                                day.date.toDateString() === selectedDate.toDateString();

                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`
                                        border-b border-r border-slate-100 dark:border-slate-700/50 cursor-pointer transition-colors relative flex flex-col overflow-hidden min-h-[100px] p-1
                                        ${!day.isCurrentMonth ? "bg-slate-50/50 dark:bg-slate-900/30" : ""}
                                        ${isSelected ? "bg-violet-50 dark:bg-violet-900/20 ring-1 ring-inset ring-violet-500" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                                    `}
                                >
                                    {/* Date Number */}
                                    <div className="mb-1">
                                        <span
                                            className={`
                                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                                                ${isToday(day.date)
                                                    ? "bg-violet-600 text-white"
                                                    : day.isCurrentMonth
                                                        ? "text-slate-700 dark:text-slate-200"
                                                        : "text-slate-400 dark:text-slate-600"
                                                }
                                            `}
                                        >
                                            {day.date.getDate()}
                                        </span>
                                    </div>

                                    {/* Task Chips - Show only on start date */}
                                    <div className="flex flex-col gap-0.5 min-h-0 overflow-hidden flex-1">
                                        {startingTasks.slice(0, 2).map((task, taskIndex) => {
                                            // Minimal pastel color palette for unique task colors
                                            const taskColors = [
                                                { bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-700 dark:text-violet-300", border: "border-violet-300 dark:border-violet-700" },
                                                { bg: "bg-sky-100 dark:bg-sky-900/40", text: "text-sky-700 dark:text-sky-300", border: "border-sky-300 dark:border-sky-700" },
                                                { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-300 dark:border-emerald-700" },
                                                { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700" },
                                                { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-300 dark:border-rose-700" },
                                                { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-300 dark:border-indigo-700" },
                                                { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-700 dark:text-teal-300", border: "border-teal-300 dark:border-teal-700" },
                                                { bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-700 dark:text-pink-300", border: "border-pink-300 dark:border-pink-700" },
                                                { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
                                                { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-300 dark:border-cyan-700" },
                                            ];

                                            // Generate unique color based on task ID - using better hash for diversity
                                            const getColorIndex = (id) => {
                                                if (!id) return taskIndex;
                                                // Use last 6 chars of ID and multiply by position for better distribution
                                                const idPart = id.slice(-6);
                                                let hash = 0;
                                                for (let i = 0; i < idPart.length; i++) {
                                                    hash = ((hash << 5) - hash + idPart.charCodeAt(i) * (i + 1)) | 0;
                                                }
                                                return Math.abs(hash) % taskColors.length;
                                            };

                                            const colorIndex = getColorIndex(task._id);
                                            const taskColor = task.status === "completed"
                                                ? { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-400 dark:text-slate-500", border: "border-slate-200 dark:border-slate-700" }
                                                : taskColors[colorIndex];

                                            // Status Icons
                                            const StatusIcon = task.status === 'completed' ? IoCheckmarkCircle :
                                                (task.priority === 'urgent' ? IoAlertCircleOutline :
                                                    (task.status === 'in_progress' ? IoTimeOutline : IoFlagOutline));

                                            // Calculate duration in days
                                            const durationDays = Math.ceil((task.endDate - task.startDate) / (1000 * 60 * 60 * 24)) + 1;

                                            return (
                                                <div
                                                    key={task._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTask(task);
                                                    }}
                                                    className={`
                                                        flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-all border shrink-0
                                                        ${taskColor.bg} ${taskColor.text} ${taskColor.border}
                                                        ${task.status === "completed" ? "line-through opacity-60" : ""}
                                                        hover:brightness-95 dark:hover:brightness-110 hover:shadow-sm
                                                    `}
                                                >
                                                    <StatusIcon className="w-3 h-3 shrink-0" />
                                                    <span className="truncate flex-1 min-w-0">{task.title}</span>
                                                    {durationDays > 1 && (
                                                        <span className="shrink-0 text-[9px] opacity-70">{durationDays}d</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {/* Show "+X more" if there are more tasks starting on this date */}
                                        {startingTasks.length > 2 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDate(day.date);
                                                }}
                                                className="text-[9px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 text-left transition-colors shrink-0 truncate"
                                            >
                                                +{startingTasks.length - 2} more
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Selected Date Tasks Panel - Compact */}
            {selectedDate && (
                <div className="flex-none mt-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg shadow-black/5">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                {selectedDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </h3>
                            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                {getTasksSpanningDate(selectedDate).length} tasks
                            </span>
                        </div>

                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                            Close
                        </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto custom-scrollbar p-2">
                        {getTasksSpanningDate(selectedDate).length === 0 ? (
                            <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                                No tasks scheduled for this day
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {getTasksSpanningDate(selectedDate).map((task) => {
                                    const priorityColors = {
                                        urgent: "bg-red-500",
                                        high: "bg-orange-500",
                                        medium: "bg-amber-500",
                                        low: "bg-emerald-500",
                                    };

                                    return (
                                        <div
                                            key={task._id}
                                            onClick={() => setSelectedTask(task)}
                                            className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        >
                                            <button
                                                onClick={(e) => handleToggleTaskStatus(task, e)}
                                                className="shrink-0 transition-transform active:scale-95"
                                            >
                                                {task.status === "completed" ? (
                                                    <IoCheckmarkCircle className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <IoEllipseOutline className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                        {getTaskKey(task)}
                                                    </span>
                                                    <p className={`text-sm font-medium text-slate-800 dark:text-slate-100 truncate ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
                                                        {task.title}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority] || priorityColors.medium}`} />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{task.priority}</span>
                                                    </div>
                                                    {task.startDate && task.dueDate && (
                                                        <>
                                                            <span className="text-slate-300 dark:text-slate-600">•</span>
                                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                <IoTimeOutline className="w-3 h-3" />
                                                                {new Date(task.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center -space-x-2">
                                                {task.assignedToUsers?.slice(0, 3).map((assignee) => (
                                                    <div
                                                        key={assignee.uid}
                                                        className="w-7 h-7 rounded-full overflow-hidden bg-violet-100 border-2 border-white dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-700"
                                                        title={assignee.name}
                                                    >
                                                        {assignee.photoURL ? (
                                                            <img src={assignee.photoURL} alt={assignee.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="flex items-center justify-center w-full h-full text-violet-600 text-[10px] font-bold">
                                                                {assignee.name?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspace={workspace}
            />

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    workspace={workspace}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
};

export default TaskCalendar;
