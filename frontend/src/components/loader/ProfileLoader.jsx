import React from 'react';

const ProfileLoader = () => {
    return (
        <div className="min-h-screen bg-slate-50/30 dark:bg-transparent pb-10 animate-pulse">
            {/* Header Skeleton */}
            <div className="w-full max-w-6xl mx-auto px-4 pt-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
                    <div className="h-20 w-full bg-gray-100 dark:bg-slate-800/50" />

                    <div className="px-6 pb-6 -mt-10 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                {/* Avatar Skeleton */}
                                <div className="w-28 h-28 rounded-[24px] border-4 border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-800 shadow-xl" />

                                <div className="text-center md:text-left space-y-3 pb-1">
                                    <div className="h-8 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg mx-auto md:mx-0" />
                                    <div className="flex gap-3 justify-center md:justify-start">
                                        <div className="h-4 w-20 bg-gray-100 dark:bg-slate-800/50 rounded" />
                                        <div className="h-5 w-24 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-end gap-8 px-2 md:pb-1">
                                <div className="text-center space-y-1">
                                    <div className="h-6 w-8 bg-gray-200 dark:bg-slate-800 rounded mx-auto" />
                                    <div className="h-2 w-10 bg-gray-100 dark:bg-slate-800/50 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="w-full max-w-6xl mx-auto px-4 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        {/* Summary Skeleton */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-6 bg-gray-200 dark:bg-slate-800 rounded-full" />
                                <div className="h-5 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] border border-gray-50 dark:border-slate-800 h-24" />
                        </div>

                        {/* Experience Skeleton */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-6 bg-gray-200 dark:bg-slate-800 rounded-full" />
                                <div className="h-5 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
                            </div>
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-50 dark:border-slate-800 flex gap-4">
                                    <div className="w-11 h-11 bg-gray-100 dark:bg-slate-800 rounded-xl shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-gray-200 dark:bg-slate-800 rounded" />
                                        <div className="h-3 w-1/4 bg-gray-100 dark:bg-slate-800/50 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="space-y-4">
                            <div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded px-1" />
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-50 dark:border-slate-800 h-32" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-3 w-20 bg-gray-200 dark:bg-slate-800 rounded px-1" />
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-50 dark:border-slate-800 space-y-3">
                                <div className="h-10 w-full bg-gray-100 dark:bg-slate-800/50 rounded-xl" />
                                <div className="h-10 w-full bg-gray-100 dark:bg-slate-800/50 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLoader;
