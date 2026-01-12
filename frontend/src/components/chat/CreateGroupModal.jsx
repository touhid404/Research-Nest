import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaSearch, FaCheck, FaBriefcase, FaComments } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useChatStore from "../../store/useChatStore";
import useAuth from "../../hooks/useAuth";

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { users, createGroupConversation, isLoading } = useChatStore();
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [createWorkspace, setCreateWorkspace] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setGroupName("");
            setSelectedUsers([]);
            setSearchTerm("");
            setCreateWorkspace(false);
        }
    }, [isOpen]);

    // Filter users (exclude current user and filter by search)
    const filteredUsers = users.filter(u => {
        if (!u.uid) return false;
        const isMe = u.uid === user?.uid;
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return !isMe && matchesSearch;
    });

    const toggleUser = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSubmit = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

        try {
            await createGroupConversation(selectedUsers, groupName, createWorkspace);
            toast.success(createWorkspace ? "Group and Workspace created!" : "Group created successfully!");
            onClose();
        } catch (error) {
            console.error("Failed to create group:", error);
            toast.error("Failed to create group");
        }
    };

    if (!isOpen) return null;

    return createPortal(
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
                        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-white/20 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-3 pl-4 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">New Group</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Start a conversation with your team</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Body - Flex layout to handle scrolling properly */}
                        <div className="flex-1 flex flex-col min-h-0 px-6 py-4 space-y-4">

                            {/* Type Selection - Compact (Static) */}
                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                <button
                                    onClick={() => setCreateWorkspace(false)}
                                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${!createWorkspace
                                        ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-600"
                                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        }`}
                                >
                                    <FaComments className={!createWorkspace ? "text-violet-600" : "text-slate-400"} />
                                    <span className="text-sm font-bold">Chat Only</span>
                                </button>
                                <button
                                    onClick={() => setCreateWorkspace(true)}
                                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${createWorkspace
                                        ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-600"
                                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <FaComments className={createWorkspace ? "text-violet-600" : "text-slate-400"} />
                                        <span className="text-xs">+</span>
                                        <FaBriefcase className={createWorkspace ? "text-violet-600" : "text-slate-400"} />
                                    </div>
                                    <span className="text-sm font-bold">Both: Chat & Workspace</span>
                                </button>
                            </div>

                            {/* Group Name Input (Static) */}
                            <div className="shrink-0">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Project Alpha"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full text-slate-900 dark:text-white px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                                    autoFocus
                                />
                            </div>

                            {/* User Selection Section (Flex Container) */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 shrink-0">
                                    Members <span className="text-xs font-normal text-slate-500">({selectedUsers.length} selected)</span>
                                </label>

                                {/* Search (Static) */}
                                <div className="relative mb-3 shrink-0">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search people..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                {/* Users List (Scrollable) */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0 space-y-1">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => {
                                            const isSelected = selectedUsers.includes(user.uid);
                                            return (
                                                <div
                                                    key={user.uid}
                                                    onClick={() => toggleUser(user.uid)}
                                                    className={`
                                                        flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all
                                                        ${isSelected
                                                            ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800"
                                                            : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                                                        }
                                                    `}
                                                >
                                                    {/* Avatar */}
                                                    <div className="avatar placeholder shrink-0">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                            {user.photoURL ? (
                                                                <img src={user.photoURL} alt={user.name} />
                                                            ) : (
                                                                <span className="flex items-center justify-center w-full h-full text-xs font-bold text-slate-500">
                                                                    {user.name?.charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"}`}>
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                    </div>

                                                    {/* Checkbox UI */}
                                                    <div className={`
                                                        w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0
                                                        ${isSelected
                                                            ? "bg-violet-500 border-violet-500 text-white"
                                                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                        }
                                                    `}>
                                                        {isSelected && <FaCheck size={10} />}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-slate-400">No users found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-2 shrink-0 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!groupName.trim() || selectedUsers.length === 0 || isLoading}
                                className="px-6 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-violet-500/25 transition-all"
                            >
                                {isLoading ? "Creating..." : createWorkspace ? "Create Group & Workspace" : "Create Group"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CreateGroupModal;
