import { FaSearch, FaPlus, FaUserSlash } from "react-icons/fa";
import { Link } from "react-router";
import useChatStore from "../../store/useChatStore";
import { useEffect } from "react";

const SidebarHeader = ({ searchTerm, setSearchTerm, setIsGroupModalOpen }) => {
    const { blockedUsers, fetchBlockedUsers } = useChatStore();

    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    return (
        <div className="p-2">
            <div className="relative group">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                />
            </div>

            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => setIsGroupModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-300 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors text-xs font-semibold"
                >
                    <FaPlus size={10} />
                    <span>New Group</span>
                </button>

                {blockedUsers?.length > 0 && (
                    <Link
                        to="/home/messages/blocked"
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-xs font-semibold border border-red-100 dark:border-red-900/30"
                        title="Blocked Contacts"
                    >
                        <FaUserSlash size={14} />
                        <span className="hidden lg:inline">Blocked</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default SidebarHeader;
