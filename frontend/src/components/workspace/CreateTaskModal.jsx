import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoCloseOutline,
    IoCalendarOutline,
    IoTimeOutline,
    IoFlagOutline,
    IoDocumentTextOutline,
    IoPersonOutline,
    IoCheckmarkOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../store/useWorkspaceStore";

const CreateTaskModal = ({ isOpen, onClose, workspace, initialDate }) => {
    const { createTask } = useWorkspaceStore();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        startDate: "",
        estimatedHours: "",
    });
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const today = initialDate || new Date();
            const formattedDate = today.toISOString().slice(0, 16);
            setFormData({
                title: "",
                description: "",
                priority: "medium",
                dueDate: formattedDate,
                startDate: formattedDate,
                estimatedHours: "",
            });
            setSelectedAssignees([]);
        }
    }, [isOpen, initialDate]);

    const handleToggleAssignee = (member) => {
        const isSelected = selectedAssignees.some((a) => a.uid === member.uid);
        if (isSelected) {
            setSelectedAssignees(selectedAssignees.filter((a) => a.uid !== member.uid));
        } else {
            setSelectedAssignees([...selectedAssignees, member]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Task title is required");
            return;
        }

        if (formData.startDate && formData.dueDate && new Date(formData.startDate) > new Date(formData.dueDate)) {
            toast.error("Start date cannot be after due date");
            return;
        }

        setIsSubmitting(true);

        try {
            await createTask({
                workspaceId: workspace._id,
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                dueDate: formData.dueDate || null,
                startDate: formData.startDate || null,
                estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
                assignedTo: selectedAssignees.map((a) => a.uid),
            });

            toast.success("Task created successfully!");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorities = [
        { value: "low", label: "Low", color: "bg-green-500", bgLight: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
        { value: "medium", label: "Medium", color: "bg-yellow-500", bgLight: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
        { value: "high", label: "High", color: "bg-orange-500", bgLight: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
        { value: "urgent", label: "Urgent", color: "bg-red-500", bgLight: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
    ];

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
                    >
                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-violet-500/10 to-purple-500/10 rounded-bl-full" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                        Create Task
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        Add a new task to your workspace
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <IoCloseOutline className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="px-6 pb-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Title */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    <IoDocumentTextOutline className="w-3.5 h-3.5" />
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="What needs to be done?"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                                    autoFocus
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add more details..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                                />
                            </div>

                            {/* Priority */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    <IoFlagOutline className="w-3.5 h-3.5" />
                                    Priority
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {priorities.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: p.value })}
                                            className={`relative py-2 rounded-xl text-xs font-semibold transition-all ${
                                                formData.priority === p.value
                                                    ? `${p.bgLight} ${p.text} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900`
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                            style={{ 
                                                ringColor: formData.priority === p.value ? p.color.replace('bg-', '') : undefined 
                                            }}
                                        >
                                            <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${p.color}`} />
                                            <span className="ml-2">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                        <IoCalendarOutline className="w-3.5 h-3.5" />
                                        Start Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                        <IoCalendarOutline className="w-3.5 h-3.5" />
                                        Due Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            {/* Estimated Hours */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    <IoTimeOutline className="w-3.5 h-3.5" />
                                    Estimated Hours
                                </label>
                                <input
                                    type="number"
                                    value={formData.estimatedHours}
                                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                                    placeholder="e.g., 4"
                                    min="0"
                                    step="0.5"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>

                            {/* Assignees */}
                            {workspace?.members?.length > 0 && (
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                        <IoPersonOutline className="w-3.5 h-3.5" />
                                        Assign To ({selectedAssignees.length} selected)
                                    </label>
                                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto custom-scrollbar p-1">
                                        {workspace.members.map((member) => {
                                            const isSelected = selectedAssignees.some((a) => a.uid === member.uid);
                                            return (
                                                <button
                                                    key={member.uid}
                                                    type="button"
                                                    onClick={() => handleToggleAssignee(member)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                        isSelected
                                                            ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                    }`}
                                                >
                                                    <div className="relative w-5 h-5 rounded-full overflow-hidden bg-linear-to-br from-violet-500 to-purple-600 shrink-0">
                                                        {member.user?.photoURL ? (
                                                            <img src={member.user.photoURL} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="flex items-center justify-center w-full h-full text-white text-[9px] font-bold">
                                                                {member.user?.name?.charAt(0)}
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-violet-500/80 flex items-center justify-center">
                                                                <IoCheckmarkOutline className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {member.user?.name?.split(" ")[0]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.title.trim()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Task"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;

    return createPortal(modalContent, document.body);
};

export default CreateTaskModal;
