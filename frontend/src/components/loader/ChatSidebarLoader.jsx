import React from 'react';

const ChatSidebarLoader = ({ count = 6 }) => {
    const items = Array.from({ length: count });

    return (
        <div className="space-y-4 p-2">
            {/* Recent Chats Section */}
            <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800 rounded px-3 py-1 mb-2 animate-pulse" />
                {items.map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-xl animate-pulse"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex justify-between items-baseline">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
                                <div className="h-3 w-10 bg-gray-100 dark:bg-slate-800 rounded" />
                            </div>
                            <div className="h-3 w-32 bg-gray-100 dark:bg-slate-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Suggested People Section */}
            <div className="space-y-2 pt-4">
                <div className="h-3 w-28 bg-gray-100 dark:bg-slate-800 rounded px-3 py-1 mb-2 animate-pulse" />
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-xl animate-pulse"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded" />
                            <div className="h-3 w-36 bg-gray-100 dark:bg-slate-800 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatSidebarLoader;
