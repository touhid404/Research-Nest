import { useState, useEffect, useMemo } from "react";
import {
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoAddOutline,
    IoTimeOutline,
    IoCheckmarkCircle,
    IoEllipseOutline,
} from "react-icons/io5";
import useWorkspaceStore from "../../store/useWorkspaceStore";
import useAuth from "../../hooks/useAuth";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";

const TaskCalendar = ({ workspace }) => {
    const { user } = useAuth();
    const { tasks, fetchTasks, updateTask, loadingTasks } = useWorkspaceStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState("month"); // month, week
    const [selectedDate, setSelectedDate] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (workspace?._id) {
            // Fetch tasks for the current month range
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            fetchTasks(workspace._id, {
                startDate: startOfMonth.toISOString(),
                endDate: endOfMonth.toISOString(),
                forceRefresh: true
            });
        }
    }, [workspace?._id, currentDate.getMonth(), currentDate.getFullYear()]); // Remove fetchTasks - stable from Zustand

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

    // Get tasks for a specific date
    const getTasksForDate = (date) => {
        return tasks.filter((task) => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return (
                taskDate.getFullYear() === date.getFullYear() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getDate() === date.getDate()
            );
        });
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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500";
            case "high":
                return "bg-orange-500";
            case "medium":
                return "bg-yellow-500";
            default:
                return "bg-green-500";
        }
    };

    const handleToggleTaskStatus = async (task, e) => {
        e.stopPropagation();
        const newStatus = task.status === "completed" ? "todo" : "completed";
        await updateTask(task._id, { status: newStatus });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
                    <div className="grid grid-cols-7 h-full" style={{ gridTemplateRows: 'repeat(6, minmax(80px, 1fr))' }}>
                        {calendarDays.map((day, index) => {
                            const dayTasks = getTasksForDate(day.date);
                            const isSelected =
                                selectedDate &&
                                day.date.toDateString() === selectedDate.toDateString();

                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`
                                        p-1.5 border-b border-r border-slate-100 dark:border-slate-700/50 cursor-pointer transition-colors
                                        ${!day.isCurrentMonth ? "bg-slate-50/50 dark:bg-slate-900/30" : ""}
                                        ${isSelected ? "bg-violet-50 dark:bg-violet-900/20 ring-1 ring-inset ring-violet-500" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                                    `}
                                >
                                    {/* Date Number */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className={`
                                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
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
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {dayTasks.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tasks */}
                                    <div className="space-y-0.5 overflow-hidden">
                                        {dayTasks.slice(0, 2).map((task) => (
                                            <div
                                                key={task._id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTask(task);
                                                }}
                                                className={`
                                                    flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-all truncate
                                                    ${task.status === "completed"
                                                        ? "bg-slate-100 dark:bg-slate-700 text-slate-400 line-through"
                                                        : "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50"
                                                    }
                                                `}
                                        >
                                                <button
                                                    onClick={(e) => handleToggleTaskStatus(task, e)}
                                                    className="shrink-0"
                                                >
                                                    {task.status === "completed" ? (
                                                        <IoCheckmarkCircle className="w-3 h-3 text-green-500" />
                                                    ) : (
                                                        <IoEllipseOutline className="w-3 h-3" />
                                                    )}
                                                </button>
                                                <span className="truncate">{task.title}</span>
                                            </div>
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <p className="text-[10px] text-slate-400 pl-1">
                                                +{dayTasks.length - 2} more
                                            </p>
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
                <div className="flex-none mt-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {selectedDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </h3>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                            Close
                        </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {getTasksForDate(selectedDate).length === 0 ? (
                            <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                                No tasks scheduled
                            </p>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {getTasksForDate(selectedDate).map((task) => (
                                    <div
                                        key={task._id}
                                        onClick={() => setSelectedTask(task)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                    >
                                        <button
                                            onClick={(e) => handleToggleTaskStatus(task, e)}
                                            className="shrink-0"
                                        >
                                            {task.status === "completed" ? (
                                                <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <IoEllipseOutline className="w-5 h-5 text-slate-400" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium text-slate-800 dark:text-slate-100 truncate ${task.status === "completed" ? "line-through text-slate-400" : ""}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                                                <span className="text-xs text-slate-400 capitalize">{task.priority}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center -space-x-1.5">
                                            {task.assignedToUsers?.slice(0, 2).map((assignee) => (
                                                <div
                                                    key={assignee.uid}
                                                    className="w-6 h-6 rounded-full overflow-hidden bg-violet-500 border-2 border-white dark:border-slate-800"
                                                    title={assignee.name}
                                                >
                                                    {assignee.photoURL ? (
                                                        <img src={assignee.photoURL} alt={assignee.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="flex items-center justify-center w-full h-full text-white text-[10px]">
                                                            {assignee.name?.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
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
