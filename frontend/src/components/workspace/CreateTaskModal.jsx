import { useState } from "react";
import { IoCloseOutline, IoPersonAddOutline, IoCalendarOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../store/useWorkspaceStore";

const CreateTaskModal = ({ isOpen, onClose, workspace }) => {
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
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            priority: "medium",
            dueDate: "",
            startDate: "",
            estimatedHours: "",
        });
        setSelectedAssignees([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Create New Task
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <IoCloseOutline className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
                    {/* Title */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Write literature review section"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed description of the task..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Priority & Estimated Hours */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Estimated Hours
                            </label>
                            <input
                                type="number"
                                value={formData.estimatedHours}
                                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                                placeholder="e.g., 4"
                                min="0"
                                step="0.5"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Due Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Assign To */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Assign To
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {workspace.members?.map((member) => (
                                <button
                                    key={member.uid}
                                    type="button"
                                    onClick={() => handleToggleAssignee(member)}
                                    className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all
                                        ${selectedAssignees.some((a) => a.uid === member.uid)
                                            ? "border-violet-500 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                            : "border-slate-200 dark:border-slate-600 hover:border-violet-300 dark:hover:border-violet-700"
                                        }
                                    `}
                                >
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-violet-500">
                                        {member.user?.photoURL ? (
                                            <img src={member.user.photoURL} alt={member.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="flex items-center justify-center w-full h-full text-white text-xs font-medium">
                                                {member.user?.name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm">{member.user?.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
