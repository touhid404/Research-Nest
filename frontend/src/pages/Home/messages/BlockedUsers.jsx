import { useState, useEffect } from "react";
import useChatStore from "../../../store/useChatStore";
import { FaUserSlash, FaTrashAlt, FaArrowLeft } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import ConfirmModal from "../../../components/common/ConfirmModal";

const BlockedUsers = () => {
    const { blockedUsers, fetchBlockedUsers, unblockUser } = useChatStore();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);

    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    const handleUnblockClick = (user) => {
        setSelectedUser(user);
        setIsUnblockModalOpen(true);
    };

    const handleConfirmUnblock = () => {
        if (selectedUser) {
            unblockUser(selectedUser.uid);
            setIsUnblockModalOpen(false);
            setSelectedUser(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800">
            <Helmet>
                <title>Blocked Users | Research Nest</title>
            </Helmet>

            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaUserSlash className="text-red-500 shrink-0" />
                        <span className="truncate">Blocked Users</span>
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 md:line-clamp-none">
                        Manage the people you've blocked. Blocked users cannot message you.
                    </p>
                </div>
                <Link
                    to="/home/messages"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-semibold border border-gray-100 dark:border-slate-700 shrink-0 self-start sm:self-center"
                >
                    <FaArrowLeft size={14} />
                    <span>Back to Chat</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {!blockedUsers || blockedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 opacity-60">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-8 ring-gray-25 dark:ring-slate-800/50">
                            <FaUserSlash className="text-3xl text-gray-300" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">No blocked users</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[250px]">You haven't blocked anyone yet. Your block list is empty.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {blockedUsers.map((user) => (
                            <div 
                                key={user.uid} 
                                className="group p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="avatar placeholder shrink-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-gray-50 ring-offset-2 ring-offset-white dark:ring-slate-700 dark:ring-offset-slate-900 bg-slate-100 dark:bg-slate-700">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt={user.name} className="object-cover rounded-full" />
                                            ) : (
                                                <span className="text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base" title={user.name}>
                                            {user.name}
                                        </h3>
                                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleUnblockClick(user)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90 shrink-0"
                                        title="Unblock User"
                                    >
                                        <FaTrashAlt size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isUnblockModalOpen}
                onClose={() => setIsUnblockModalOpen(false)}
                onConfirm={handleConfirmUnblock}
                title={`Unblock ${selectedUser?.name}?`}
                message={`Are you sure you want to unblock ${selectedUser?.name}? You will be able to message each other again.`}
                confirmText="Unblock User"
            />
        </div>
    );
};

export default BlockedUsers;
