import {
    IoMenuOutline,
    IoSearchOutline,
    IoGridOutline,
    IoListOutline,
    IoCloudUploadOutline,
    IoFolderOutline,
    IoAddOutline,
    IoFolderOpenOutline,
    IoChevronForward
} from "react-icons/io5";

const DocumentToolbar = ({
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    setShowSidebar,
    onUploadClick,
    onNewFolderClick,
    onNewDocClick,
    fileInputRef,
    handleFileInputChange,
    documents,
    currentFolderId,
    onNavigate
}) => {
    const getBreadcrumbs = () => {
        if (!currentFolderId) return [];
        const breadcrumbs = [];
        let current = documents.find(d => d._id === currentFolderId);
        while (current) {
            breadcrumbs.unshift(current);
            current = documents.find(d => d._id === current.parentId);
        }
        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="py-2 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                    onClick={() => setShowSidebar(true)}
                    className="sm:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"
                >
                    <IoMenuOutline className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar hidden md:flex">
                        <button
                            onClick={() => onNavigate(null)}
                            className={`flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-md transition-colors whitespace-nowrap ${!currentFolderId ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}
                        >
                            <IoFolderOpenOutline className="w-4 h-4" />
                            <span className="text-xs">Root</span>
                        </button>
                        {breadcrumbs.map((folder, index) => (
                            <div key={folder._id} className="flex items-center gap-1.5 shrink-0">
                                <IoChevronForward className="w-3 h-3 text-slate-400" />
                                <button
                                    onClick={() => onNavigate(folder._id)}
                                    className={`hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-md transition-colors whitespace-nowrap text-xs ${index === breadcrumbs.length - 1 ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}
                                >
                                    {folder.title}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden lg:block"></div>

                    <div className="relative max-w-[240px] w-full flex-1">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-xs w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg pl-8 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <IoSearchOutline className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* View Mode Toggles */}
                <div className="join bg-slate-100 dark:bg-slate-800 p-1 rounded-lg hidden sm:flex">
                    <button
                        className={`join-item btn btn-xs btn-ghost hover:bg-white dark:hover:bg-slate-700 ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"}`}
                        onClick={() => setViewMode("grid")}
                    >
                        <IoGridOutline className="w-4 h-4" />
                    </button>
                    <button
                        className={`join-item btn btn-xs btn-ghost hover:bg-white dark:hover:bg-slate-700 ${viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"}`}
                        onClick={() => setViewMode("list")}
                    >
                        <IoListOutline className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                {/* Actions */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileInputChange}
                    multiple
                />
                <button
                    onClick={onUploadClick}
                    className="btn btn-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-300 gap-2"
                >
                    <IoCloudUploadOutline className="w-4 h-4" />
                    <span className="hidden lg:inline">Upload</span>
                </button>

                <button
                    onClick={onNewFolderClick}
                    className="btn btn-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-500 text-slate-600 dark:text-slate-300 gap-2"
                >
                    <IoFolderOutline className="w-4 h-4" />
                    <span className="hidden lg:inline">New Folder</span>
                </button>

                <button
                    onClick={onNewDocClick}
                    className="btn btn-sm btn-primary text-white gap-2 shadow-lg shadow-primary/20"
                >
                    <IoAddOutline className="w-5 h-5" />
                    <span className="hidden sm:inline">New Doc</span>
                </button>
            </div>
        </div>
    );
};

export default DocumentToolbar;
