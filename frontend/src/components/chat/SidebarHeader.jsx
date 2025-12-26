import { FaSearch, FaPlus } from "react-icons/fa";

const SidebarHeader = ({ searchTerm, setSearchTerm, setIsGroupModalOpen }) => {
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

            <button
                onClick={() => setIsGroupModalOpen(true)}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-300 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors text-sm font-semibold"
            >
                <FaPlus size={12} />
                <span>New Group</span>
            </button>
        </div>
    );
};

export default SidebarHeader;
