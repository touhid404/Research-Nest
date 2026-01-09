import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoCloseOutline, IoPeopleOutline, IoCheckmarkCircle, IoLayersOutline } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi2";
import toast from "react-hot-toast";
import useWorkspaceStore from "../../store/useWorkspaceStore";
import useChatStore from "../../store/useChatStore";
import useAuth from "../../hooks/useAuth";

const CreateWorkspaceModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { createWorkspace, workspaces } = useWorkspaceStore();
    const { conversations, fetchConversations } = useChatStore();

    const [formData, setFormData] = useState({ name: "", description: "" });
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (isOpen && !hasLoaded) {
            fetchConversations();
            setHasLoaded(true);
        }
    }, [isOpen, hasLoaded]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: "", description: "" });
            setSelectedGroup(null);
        }
    }, [isOpen]);

    // Get conversation IDs that already have workspaces
    const existingWorkspaceConversationIds = workspaces
        .filter(ws => ws.conversationId)
        .map(ws => ws.conversationId);

    // Get group conversations where user is the admin AND no workspace exists
    const groupConversations = conversations.filter(
        (conv) => conv.isGroup && 
                  conv.groupAdmin === user?.uid && 
                  !existingWorkspaceConversationIds.includes(conv._id)
    );

    const handleSelectGroup = (conv) => {
        if (selectedGroup?._id === conv._id) {
            setSelectedGroup(null);
            setFormData(prev => ({ ...prev, name: "" }));
        } else {
            setSelectedGroup(conv);
            setFormData(prev => ({ ...prev, name: `${conv.groupName || "Team"} Workspace` }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Workspace name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const memberUids = selectedGroup?.participants
                ?.filter(p => p.uid !== user?.uid)
                ?.map(p => p.uid) || [];

            await createWorkspace({
                name: formData.name.trim(),
                description: formData.description.trim(),
                memberUids,
                conversationId: selectedGroup?._id || null,
            });

            toast.success("Workspace created!");
            onClose();
        } catch (error) {
            toast.error("Failed to create workspace");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // If user has no groups where they are admin (or all groups already have workspaces)
    if (groupConversations.length === 0) {
        const allGroupsHaveWorkspaces = conversations.some(
            (conv) => conv.isGroup && conv.groupAdmin === user?.uid
        );

        const emptyStateContent = (
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-5 bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 rounded-2xl flex items-center justify-center shadow-inner">
                                    <HiOutlineUserGroup className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                                    {allGroupsHaveWorkspaces ? "All Teams Have Workspaces" : "Create a Group First"}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {allGroupsHaveWorkspaces 
                                        ? "All your team groups already have workspaces. Create a new group to add another workspace."
                                        : "You need to be an admin of a group chat to create a workspace. Start by creating a group with your team."
                                    }
                                </p>
                            </div>
                            <div className="flex border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                                <a
                                    href="/home/messages"
                                    className="flex-1 px-4 py-3.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors border-l border-slate-200 dark:border-slate-800"
                                >
                                    {allGroupsHaveWorkspaces ? "Create Group" : "Go to Messages"}
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        );

        if (typeof document === "undefined") return null;
        return createPortal(emptyStateContent, document.body);
    }

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
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-violet-500/10 to-purple-500/10 rounded-bl-full" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                                        <IoLayersOutline className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Workspace</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Collaborate with your team</p>
                                    </div>
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

                        {/* Content */}
                        <div className="px-6 pb-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Select Team */}
                            <div>
                                <label className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Select Team
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        {groupConversations.length} available
                                    </span>
                                </label>
                                
                                <div className="max-h-32 overflow-y-auto custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                                    {groupConversations.map((conv) => (
                                        <button
                                            key={conv._id}
                                            type="button"
                                            onClick={() => handleSelectGroup(conv)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                                                selectedGroup?._id === conv._id
                                                    ? "bg-violet-50 dark:bg-violet-900/20"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                selectedGroup?._id === conv._id
                                                    ? "bg-violet-500 text-white"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                            }`}>
                                                <IoPeopleOutline className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className={`text-sm font-medium truncate ${
                                                    selectedGroup?._id === conv._id
                                                        ? "text-violet-700 dark:text-violet-300"
                                                        : "text-slate-700 dark:text-slate-200"
                                                }`}>
                                                    {conv.groupName || "Unnamed Group"}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {conv.participants?.length} members
                                                </p>
                                            </div>
                                            {selectedGroup?._id === conv._id && (
                                                <IoCheckmarkCircle className="w-5 h-5 text-violet-500 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Workspace Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    Workspace Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., AI Research Project"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                    Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of your workspace..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none text-sm custom-scrollbar"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name.trim()}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : "Create Workspace"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;

    return createPortal(modalContent, document.body);
};

export default CreateWorkspaceModal;
