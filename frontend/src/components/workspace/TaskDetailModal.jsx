import { useState } from "react";
import {
    IoCloseOutline,
    IoTrashOutline,
    IoCreateOutline,
    IoCheckmarkCircle,
    IoTimeOutline,
    IoCalendarOutline,
    IoPersonOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../store/useWorkspaceStore";

const TaskDetailModal = ({ task, workspace, onClose }) => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Task Details
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <IoCreateOutline className="w-5 h-5 text-slate-500" />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                        >
                            <IoTrashOutline className="w-5 h-5 text-red-500" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <IoCloseOutline className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                    {isEditing ? (
                        // Edit Mode
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="review">Review</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                                    {task.title}
                                </h3>
                                {task.description && (
                                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                                        {task.description}
                                    </p>
                                )}
                            </div>

                            {/* Status & Priority */}
                            <div className="flex flex-wrap gap-3">
                                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                                    {task.status.replace("_", " ")}
                                </span>
                                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority} priority
                                </span>
                            </div>

                            {/* Quick Status Change */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Update Status
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {["todo", "in_progress", "review", "completed"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                                ${task.status === status
                                                    ? "bg-violet-600 text-white"
                                                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
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
                                    <IoCalendarOutline className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">
                                        Due: {formatDate(task.dueDate)}
                                    </span>
                                </div>

                                {task.estimatedHours && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <IoTimeOutline className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-300">
                                            Estimated: {task.estimatedHours} hours
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Assignees */}
                            {task.assignedToUsers && task.assignedToUsers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Assigned To
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {task.assignedToUsers.map((assignee) => (
                                            <div
                                                key={assignee.uid}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full"
                                            >
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-violet-500">
                                                    {assignee.photoURL ? (
                                                        <img src={assignee.photoURL} alt={assignee.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="flex items-center justify-center w-full h-full text-white text-xs">
                                                            {assignee.name?.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-slate-700 dark:text-slate-200">
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
            </div>
        </div>
    );
};

export default TaskDetailModal;
