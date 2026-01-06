import React from 'react';

const RequestLoader = ({ count = 5 }) => {
    const cards = Array.from({ length: count });

    return (
        <div className="space-y-4">
            {cards.map((_, index) => (
                <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start gap-4 p-5 mb-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden animate-pulse"
                >
                    {/* Decoration gradient */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

                    {/* Avatar Section */}
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />

                    {/* Info Section */}
                    <div className="flex-1 w-full min-w-0 z-10">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
                                <div className="h-5 w-20 bg-gray-100 dark:bg-slate-800 rounded-full" />
                            </div>
                            <div className="h-3 w-24 bg-gray-100 dark:bg-slate-800 rounded mt-2 sm:mt-0" />
                        </div>

                        {/* Content Box */}
                        <div className="mb-3 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800 mx-[-0.5rem] sm:mx-0">
                            <div className="h-3 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-200 dark:bg-slate-700 rounded" />
                                <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="flex items-center gap-3 mt-3">
                            <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-full" />
                            <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RequestLoader;
