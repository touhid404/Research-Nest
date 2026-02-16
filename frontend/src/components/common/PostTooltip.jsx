/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FaBriefcase, FaGraduationCap, FaFlask } from "react-icons/fa";

// Convert interest to abbreviation (e.g., "Artificial Intelligence" -> "AI")
const getAbbreviation = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length === 1) {
        // Single word: return first 3 chars
        return text.slice(0, 3).toUpperCase();
    }
    // Multiple words: return first letter of each word
    return words.map(word => word[0]?.toUpperCase() || "").join("");
};

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
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1.5 rounded-lg border border-white/10 dark:border-slate-200 flex flex-col gap-1 w-[180px] max-h-[100px] overflow-hidden">
                {/* Header: User Avatar & Name */}
                <div className="flex items-center gap-2 pb-1 border-b border-white/10 dark:border-slate-200/50">
                    <div className="flex gap-1.5">
                        <p className="text-[10px] font-bold tracking-tight leading-none truncate text-white dark:text-slate-900">
                            {user.occupation}
                        </p>
                        
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-1 overflow-hidden">
                    {user.researchInterests?.length > 0 && (
                        <div className="flex items-start gap-1.5">
                            <div className="w-4 h-4 rounded-md bg-purple-400/20 dark:bg-purple-100 flex items-center justify-center text-purple-300 dark:text-purple-600 shrink-0">
                                <FaFlask size={7} />
                            </div>
                            {/* Show interests as abbreviations */}
                            <div className="flex flex-wrap gap-1 mt-0.5 overflow-hidden max-h-8">
                                {user.researchInterests.slice(0, 4).map((interest, i) => (
                                    <span 
                                        key={i} 
                                        className="text-[8px] font-bold uppercase tracking-wide bg-purple-400/20 dark:bg-purple-100 text-purple-300 dark:text-purple-700 px-1 py-0.5 rounded"
                                        title={interest}
                                    >
                                        {getAbbreviation(interest)}
                                    </span>
                                ))}
                                {user.researchInterests.length > 4 && (
                                    <span className="text-[8px] font-bold text-gray-300 dark:text-gray-600">
                                        +{user.researchInterests.length - 4}
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
