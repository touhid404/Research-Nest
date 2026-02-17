import { useState, useRef, useEffect } from "react";
import { IoChevronDownOutline, IoAddOutline, IoSearchOutline } from "react-icons/io5";

const WorkspaceSelector = ({ workspaces, selectedWorkspace, onSelect, onCreateNew }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredWorkspaces = workspaces.filter((ws) =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-w-[200px]"
            >
                <span className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {selectedWorkspace?.name || "Select Workspace"}
                </span>
                <IoChevronDownOutline
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-[999]">
                    {/* Search */}
                    <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search workspaces..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 border-none rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Workspace List */}
                    <div className="max-h-60 overflow-y-auto p-2">
                        {filteredWorkspaces.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                No workspaces found
                            </p>
                        ) : (
                            filteredWorkspaces.map((workspace) => (
                                <button
                                    key={workspace._id}
                                    onClick={() => {
                                        onSelect(workspace);
                                        setIsOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                                        ${selectedWorkspace?._id === workspace._id
                                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                                        }
                                    `}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-sm">
                                        {workspace.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{workspace.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {workspace.members?.length || 0} members
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Create New Button */}
                    <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => {
                                onCreateNew();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                        >
                            <IoAddOutline className="w-5 h-5" />
                            <span className="text-sm font-medium">Create New Workspace</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceSelector;
