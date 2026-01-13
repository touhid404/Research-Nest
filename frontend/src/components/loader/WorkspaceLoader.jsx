const WorkspaceLoader = () => {
    return (
        <div className="h-full w-full relative overflow-hidden bg-gray-50/30 dark:bg-slate-950/30">
            <div className="p-4 lg:p-6 space-y-6 animate-pulse">
                {/* Decoration gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-20 -mt-20 pointer-events-none" />

                {/* Tabs Skeleton */}
                <div className="flex items-center justify-center gap-6 mb-8 border-b border-gray-100 dark:border-slate-800/50 pb-2 relative z-10 w-full overflow-x-auto custom-scrollbar">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-2 shrink-0">
                            <div className="w-5 h-5 rounded bg-gray-100 dark:bg-slate-800" />
                            <div className="w-16 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                    ))}
                </div>

                {/* Stats Cards Skeleton (Matching Image) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-36 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between"
                        >
                            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800" />
                            <div className="space-y-2">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                                <div className="space-y-1">
                                    <div className="w-24 h-3 bg-gray-200/60 dark:bg-slate-700/60 rounded" />
                                    <div className="w-16 h-2 bg-gray-100 dark:bg-slate-800 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                    {/* Left Column Skeletons */}
                    <div className="space-y-6">
                        {/* Task Card Skeleton */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm min-h-[300px]">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800" />
                                    <div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800" />
                            </div>
                            <div className="flex flex-col items-center justify-center flex-1 py-12 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-slate-700" />
                                </div>
                                <div className="w-32 h-3 bg-gray-200/60 dark:bg-slate-700/60 rounded mx-auto" />
                            </div>
                        </div>

                        {/* Team Members Skeleton */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-slate-800/50">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800" />
                                <div className="w-28 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700" />
                                        <div className="space-y-1.5 min-w-0">
                                            <div className="w-16 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                                            <div className="w-10 h-2 bg-gray-100 dark:bg-slate-800 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Skeletons */}
                    <div className="space-y-6">
                        {/* Meetings Card Skeleton */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm min-h-[300px]">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-slate-800/50">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800" />
                                <div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="flex flex-col items-center justify-center flex-1 py-12 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-lg border-2 border-gray-200 dark:border-slate-700" />
                                </div>
                                <div className="w-32 h-3 bg-gray-200/60 dark:bg-slate-700/60 rounded mx-auto" />
                            </div>
                        </div>

                        {/* Recent Documents Skeleton */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-slate-800/50">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800" />
                                <div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="px-5 py-4 flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-800/50 flex items-center justify-center">
                                            <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="w-3/4 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                                            <div className="w-1/4 h-2 bg-gray-100 dark:bg-slate-800 rounded" />
                                        </div>
                                        <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default WorkspaceLoader;
