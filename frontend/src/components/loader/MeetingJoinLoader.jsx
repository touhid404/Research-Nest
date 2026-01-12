import { Loader2 } from "lucide-react";

const MeetingJoinLoader = () => {
    return (
        <div className="h-screen w-full flex flex-col bg-white dark:bg-slate-900 animate-pulse overflow-hidden relative">
            {/* Decoration gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-20 -mt-20 pointer-events-none" />

            {/* Skeleton Header */}
            <div className="h-16 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between px-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700" />
                    <div className="space-y-2">
                        <div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded-md" />
                        <div className="w-20 h-3 bg-gray-200/60 dark:bg-slate-700/60 rounded-md" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700" />
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700" />
                </div>
            </div>

            {/* Skeleton Content */}
            <div className="flex-1 bg-gray-50/50 dark:bg-slate-950/50 flex flex-col items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-4xl aspect-video bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 relative overflow-hidden flex items-center justify-center shadow-sm">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/5 dark:to-purple-900/5 pointer-events-none" />
                    <div className="text-center relative z-10">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                        <div className="w-48 h-4 bg-gray-200 dark:bg-slate-700 rounded-md mx-auto mb-2" />
                        <div className="w-32 h-3 bg-gray-200/60 dark:bg-slate-700/60 rounded-md mx-auto" />
                    </div>

                    {/* Bottom Controls Placeholder */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50" />
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50" />
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50" />
                    </div>
                </div>
            </div>

            {/* Skeleton Footer */}
            <div className="h-24 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-900/50 flex items-center justify-center px-6 relative z-10">
                <div className="flex items-center gap-8">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800" />
                    <div className="w-48 h-12 bg-gray-200 dark:bg-slate-700 rounded-2xl" />
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800" />
                </div>
            </div>
        </div>
    );
};

export default MeetingJoinLoader;
