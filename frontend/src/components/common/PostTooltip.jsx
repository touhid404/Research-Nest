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
            className="absolute bottom-full left-1/2 -translate-x-1/2 z-60 pointer-events-none mb-3"
        >
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-4 px-4 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-slate-800 flex flex-col gap-3.5 min-w-[200px]">
                {/* Header: User Avatar & Name */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-slate-800/50">
                    <div className="relative shrink-0">
                        <img
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`}
                            alt={user.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-gray-100 dark:border-slate-700 shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-black tracking-tight leading-none mb-1">
                            {user.occupation}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            @{user.username || "researcher"}
                        </p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-2.5">
                    {user.researchInterests?.length > 0 && (
                        <div className="flex items-start gap-2.5">
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
