import React from 'react';

export const TrendingSkeleton = ({ count = 5 }) => {
    return (
        <div className="flex flex-col gap-5 animate-pulse">
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center justify-between flex-1 min-w-0">
                        {/* Topic Name Skeleton */}
                        <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg mr-3" />
                        {/* Count Skeleton */}
                        <div className="h-3 w-16 bg-gray-100 dark:bg-slate-800 rounded-lg shrink-0" />
                    </div>
                    {/* Action indicator skeleton */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 shrink-0" />
                </div>
            ))}
        </div>
    );
};

export const ResearchersSkeleton = ({ count = 5 }) => {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar Skeleton */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />

                        <div className="flex flex-col gap-2 min-w-0">
                            {/* Name Skeleton */}
                            <div className="h-3.5 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg" />
                            {/* Occupation Skeleton */}
                            <div className="h-2.5 w-16 bg-gray-100 dark:bg-slate-800 rounded-lg" />
                        </div>
                    </div>

                    {/* Message Button Skeleton */}
                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 shrink-0" />
                </div>
            ))}
        </div>
    );
};

const RightSidebarLoader = () => {
    return (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex-1 min-h-0 p-4 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg mb-6" />
                <TrendingSkeleton />
            </div>
            <div className="flex-1 min-h-0 p-4 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded-lg mb-6" />
                <ResearchersSkeleton />
            </div>
        </div>
    );
};

export default RightSidebarLoader;
