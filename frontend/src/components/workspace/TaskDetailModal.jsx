import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoCloseOutline,
    IoTrashOutline,
    IoCreateOutline,
    IoCheckmarkCircle,
    IoTimeOutline,
    IoCalendarOutline,
    IoPersonOutline,
    IoCheckmarkOutline,
    IoFlagOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../store/useWorkspaceStore";

const TaskDetailModal = ({ task, workspace, onClose, isOpen = true }) => {
    const { updateTask, deleteTask } = useWorkspaceStore();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async () => {
        if (!formData.title.trim()) {
            toast.error("Task title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateTask(task._id, {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                dueDate: formData.dueDate || null,
            });
            toast.success("Task updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await deleteTask(task._id);
            toast.success("Task deleted");
            onClose();
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    const handleStatusChange = async (newStatus) => {
        await updateTask(task._id, { status: newStatus });
        setFormData({ ...formData, status: newStatus });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent":
                return "text-red-500 bg-red-100 dark:bg-red-900/30";
            case "high":
                return "text-orange-500 bg-orange-100 dark:bg-orange-900/30";
            case "medium":
                return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
            default:
                return "text-green-500 bg-green-100 dark:bg-green-900/30";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-500 bg-green-100 dark:bg-green-900/30";
            case "in_progress":
                return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
            case "review":
                return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
            default:
                return "text-slate-500 bg-slate-100 dark:bg-slate-800";
        }
    };

    const formatDate = (date) => {
        if (!date) return "No due date";
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isSubmitting ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-violet-500/10 to-purple-500/10 rounded-bl-full" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                                        task.status === "completed"
                                            ? "bg-linear-to-br from-green-500 to-emerald-600 shadow-green-500/25"
                                            : "bg-linear-to-br from-violet-500 to-purple-600 shadow-violet-500/25"
                                    }`}>
                                        {task.status === "completed" 
                                            ? <IoCheckmarkOutline className="w-5 h-5 text-white" />
                                            : <IoFlagOutline className="w-5 h-5 text-white" />
                                        }
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Task Details</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {isEditing ? "Edit task information" : "View & manage task"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`p-2 rounded-xl transition-colors ${
                                            isEditing 
                                                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                                        }`}
                                    >
                                        <IoCreateOutline className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors text-red-500"
                                    >
                                        <IoTrashOutline className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        <IoCloseOutline className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {isEditing ? (
                                // Edit Mode
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                            Title <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none text-sm custom-scrollbar"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm cursor-pointer"
                                            >
                                                <option value="todo">To Do</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="review">Review</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                                Priority
                                            </label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm cursor-pointer"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                            Due Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={isSubmitting}
                                            className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="space-y-5">
                                    {/* Title */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status & Priority Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${getStatusColor(task.status)}`}>
                                            {task.status.replace("_", " ")}
                                        </span>
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                            {task.priority} priority
                                        </span>
                                    </div>

                                    {/* Quick Status Change */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                            Quick Status Update
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {["todo", "in_progress", "review", "completed"].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(status)}
                                                    className={`
                                                        px-3 py-2 rounded-xl text-xs font-semibold transition-all
                                                        ${task.status === status
                                                            ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                                                            : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                                                        }
                                                    `}
                                                >
                                                    {status.replace("_", " ")}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <IoCalendarOutline className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <span className="text-slate-600 dark:text-slate-300">
                                                {formatDate(task.dueDate)}
                                            </span>
                                        </div>

                                        {task.estimatedHours && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <IoTimeOutline className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                </div>
                                                <span className="text-slate-600 dark:text-slate-300">
                                                    {task.estimatedHours} hours estimated
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assignees */}
                                    {task.assignedToUsers && task.assignedToUsers.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                                Assigned To
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {task.assignedToUsers.map((assignee) => (
                                                    <div
                                                        key={assignee.uid}
                                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                                                    >
                                                        <div className="w-6 h-6 rounded-lg overflow-hidden bg-violet-500">
                                                            {assignee.photoURL ? (
                                                                <img src={assignee.photoURL} alt={assignee.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="flex items-center justify-center w-full h-full text-white text-xs font-semibold">
                                                                    {assignee.name?.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                            {assignee.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;

    return createPortal(modalContent, document.body);
};

export default TaskDetailModal;
