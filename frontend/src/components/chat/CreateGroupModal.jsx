import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaSearch, FaCheck } from "react-icons/fa";
import useChatStore from "../../store/useChatStore";
import useAuth from "../../hooks/useAuth";

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { users, createGroupConversation, isLoading } = useChatStore();
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const modalRef = useRef(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setGroupName("");
            setSelectedUsers([]);
            setSearchTerm("");
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Filter users (exclude current user and filter by search)
    const filteredUsers = users.filter(u => {
        const isMe = u.uid === user?.uid || u._id === user?.uid;
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
            await createGroupConversation(selectedUsers, groupName);
            onClose();
        } catch (error) {
            console.error("Failed to create group:", error);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                ref={modalRef}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Group Chat</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Group Name Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                            Group Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter group name (e.g. Project Team)"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full text-black dark:text-white px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            autoFocus
                        />
                    </div>

                    {/* User Selection */}
                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                            Add Members ({selectedUsers.length})
                        </label>
                        {/* Search Users */}
                        <div className="relative mb-3">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search people..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                        </div>

                        {/* Users List */}
                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const isSelected = selectedUsers.includes(user.uid || user._id);
                                    return (
                                        <div
                                            key={user.uid || user._id}
                                            onClick={() => toggleUser(user.uid || user._id)}
                                            className={`
                                                flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all
                                                ${isSelected
                                                    ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                                }
                                            `}
                                        >
                                            {/* Checkbox UI */}
                                            <div className={`
                                                w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                                                ${isSelected
                                                    ? "bg-violet-500 border-violet-500 text-white"
                                                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                }
                                            `}>
                                                {isSelected && <FaCheck size={10} />}
                                            </div>

                                            {/* Avatar */}
                                            <div className="avatar placeholder">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.name} />
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span className={`text-sm font-medium truncat ${isSelected ? "text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"}`}>
                                                {user.name}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-sm text-slate-400 py-4">No users found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!groupName.trim() || selectedUsers.length === 0 || isLoading}
                        className="px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
                    >
                        {isLoading ? "Creating..." : "Create Group"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateGroupModal;
