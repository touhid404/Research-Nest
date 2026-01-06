import React from 'react';

const ConversationLoader = () => {
    return (
        <div className="flex flex-col h-full bg-transparent animate-pulse">
            {/* Header Skeleton */}
            <div className="flex-none border-b border-gray-100 dark:border-slate-900 p-3">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-16 bg-gray-100 dark:bg-slate-800 rounded" />
                    </div>
                </div>
            </div>

            {/* Messages List Skeleton */}
            <div className="flex-1 p-4 space-y-6 overflow-hidden">
                {/* Left side message */}
                <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 shrink-0" />
                    <div className="space-y-2 max-w-[70%]">
                        <div className="h-10 w-48 bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-bl-none" />
                    </div>
                </div>

                {/* Right side message */}
                <div className="flex items-end justify-end gap-2">
                    <div className="space-y-2 max-w-[70%] text-right">
                        <div className="h-14 w-64 bg-violet-100/50 dark:bg-violet-900/20 rounded-2xl rounded-br-none" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
                </div>

                {/* Left side message */}
                <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 shrink-0" />
                    <div className="space-y-2 max-w-[70%]">
                        <div className="h-8 w-32 bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-bl-none" />
                        <div className="h-20 w-56 bg-gray-100 dark:bg-slate-800 rounded-2xl rounded-bl-none" />
                    </div>
                </div>

                {/* Right side message */}
                <div className="flex items-end justify-end gap-2">
                    <div className="space-y-2 max-w-[70%] text-right">
                        <div className="h-10 w-40 bg-violet-100/50 dark:bg-violet-900/20 rounded-2xl rounded-br-none" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
                </div>
            </div>

            {/* Input Area Skeleton */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-900">
                <div className="h-10 w-full bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800" />
            </div>
        </div>
    );
};

export default ConversationLoader;
