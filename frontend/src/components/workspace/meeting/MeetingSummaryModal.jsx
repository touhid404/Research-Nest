/* eslint-disable no-unused-vars */
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCheckSquare,
    FaTimes,
    FaFileAlt,
    FaClock,
    FaUserCircle,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";

/**
 * Simplified and polished modal to display meeting outcomes.
 * Focuses on core summary and action items for a quick overview.
 */
const MeetingSummaryModal = ({ isOpen, onClose, meeting }) => {
    const [showTranscript, setShowTranscript] = useState(false);

    if (typeof document === "undefined") return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && meeting && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-2xl max-h-[85vh] rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl border border-white/20 dark:border-slate-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-linear-to-b from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-900/50">
                            <div className="flex gap-4">
                                <div className="mt-1 p-2.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl max-h-fit">
                                    <IoSparkles className="text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                        {meeting.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                                        <FaClock className="w-2.5 h-2.5" />
                                        <span>
                                            {meeting.summaryGeneratedAt 
                                                ? new Date(meeting.summaryGeneratedAt).toLocaleDateString() + " • " + new Date(meeting.summaryGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : "Recap"}
                                        </span>
                                        {meeting.recordedByName && (
                                            <span className="flex items-center gap-1.5 border-l border-gray-100 dark:border-slate-800 pl-2">
                                                <FaUserCircle className="w-2.5 h-2.5 text-emerald-500/70" />
                                                <span className="truncate max-w-[100px]">{meeting.recordedByName}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            {(!meeting.summary || (!meeting.summary.summary?.length && !meeting.summary.actionItems?.length)) ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                                    <IoSparkles className="text-4xl mb-3" />
                                    <h3 className="text-base font-bold">No Summary Details</h3>
                                    <p className="text-xs">Summary is still generating or was unavailable.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Proper Summary (Overview) */}
                                    {meeting.summary?.overview && (
                                        <section className="bg-violet-50/30 dark:bg-violet-500/5 p-6 rounded-[1.5rem] border border-violet-100/50 dark:border-violet-500/10 mb-2">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-3">
                                                Meeting Overview
                                            </h3>
                                            <p className="text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed italic">
                                                &ldquo;{meeting.summary.overview}&rdquo;
                                            </p>
                                        </section>
                                    )}

                                    {/* Key Takeaways */}
                                    {meeting.summary?.summary?.length > 0 && (
                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-4 ml-1">
                                                Key Takeaways
                                            </h3>
                                            <div className="space-y-3">
                                                {meeting.summary.summary.map((point, index) => (
                                                    <motion.div 
                                                        key={index}
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className="text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed pl-4 border-l-2 border-violet-500/20"
                                                    >
                                                        {point}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Next Steps */}
                                    {meeting.summary?.actionItems?.length > 0 && (
                                        <section className="pt-2">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 ml-1">
                                                Next Steps
                                            </h3>
                                            <div className="grid gap-3">
                                                {meeting.summary.actionItems.map((item, index) => (
                                                    <div key={index} className="flex gap-4 p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10">
                                                        <div className="mt-1">
                                                            <div className="w-4 h-4 rounded-md border-2 border-emerald-500/30 flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                                                                {item.action}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                                                    {item.who || "Team"}
                                                                </span>
                                                                {item.due && (
                                                                    <span className="text-[10px] text-gray-400 italic">By {item.due}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Full Transcript */}
                                    {meeting.transcript && (
                                        <section className="pt-4">
                                            <div className="flex items-center justify-between mb-4 border-t border-gray-100 dark:border-slate-800 pt-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    Full Transcript
                                                </h3>
                                                <button 
                                                    onClick={() => setShowTranscript(!showTranscript)}
                                                    className="text-[10px] font-bold text-violet-500 uppercase tracking-wider hover:underline"
                                                >
                                                    {showTranscript ? "Collapse" : "Expand"}
                                                </button>
                                            </div>
                                            
                                            <div className={`transition-all duration-300 overflow-hidden ${showTranscript ? 'max-h-[1000px]' : 'max-h-24'} relative`}>
                                                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800">
                                                    <p className={`text-[12px] leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-wrap font-sans ${!showTranscript && 'line-clamp-3'}`}>
                                                        {meeting.transcript}
                                                    </p>
                                                </div>
                                                {!showTranscript && meeting.transcript.length > 200 && (
                                                    <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
                                                )}
                                            </div>
                                        </section>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-gray-100 dark:border-slate-800 flex justify-end bg-gray-50/30 dark:bg-slate-800/20">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold shadow-lg transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default MeetingSummaryModal;
