/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FaBriefcase, FaGraduationCap, FaFlask } from "react-icons/fa";

export const UserInfoTooltip = ({ user }) => {
    if (!user) return null;
    return (
        // Move little top and center
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 z-60 pointer-events-none"
        >
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-xl border border-white/10 dark:border-slate-200 flex flex-col gap-2 min-w-[170px]">
                {/* Header: User Avatar & Name */}
                <div className="flex items-center gap-3 pb-1 border-b border-white/10 dark:border-slate-200/50">
                    <div className="flex gap-2">
                        <p className="text-sm font-black tracking-tight leading-none mb-1">
                            {user.occupation}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            @{user.username || "researcher"}
                        </p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-2">
                    {user.researchInterests?.length > 0 && (
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                <FaFlask size={10} />
                            </div>
                            {/* Show interests every words first characters if more than 3 interests else all */}
                            <div className="flex flex-wrap gap-1 mt-0.5">
                                {user.researchInterests.slice(0, 2).map((interest, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                        {interest}
                                    </span>
                                ))}
                                {user.researchInterests.length > 2 && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                        +{user.researchInterests.length - 2}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
