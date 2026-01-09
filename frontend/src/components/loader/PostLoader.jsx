
const PostLoader = ({ count = 5 }) => {
    const cards = Array.from({ length: count });

    return (
        <div className="space-y-3">
            {cards.map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden"
                >
                    {/* Decoration gradient */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-slate-700" />
                            <div className="flex flex-col gap-1">
                                <div className="w-24 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-10 h-2 bg-gray-200 dark:bg-slate-700 rounded" />
                                    <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded-full" />
                                    <div className="w-16 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="mb-3">
                        <div className="w-3/4 h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="w-full h-12 bg-gray-200 dark:bg-slate-700 rounded" />
                    </div>

                    {/* Attachments */}
                    <div className="mb-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="w-20 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="w-full h-8 bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="w-full h-8 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex gap-2">
                            <div className="w-10 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                            <div className="w-10 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="w-20 h-8 bg-gray-200 dark:bg-slate-700 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostLoader;
