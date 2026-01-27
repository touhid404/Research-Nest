import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BiCheck, BiX } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";

const AiSpellCheckModal = ({
    isOpen,
    onClose,
    originalText,
    correctedText,
    corrections = [],
    onApply,
    isLoading
}) => {
    if (typeof document === "undefined") return null;

    const content = (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute bottom-full mb-3 left-0 z-30 w-full sm:w-[450px]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isLoading ? (
                            <div className="p-4 flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Checking...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                            <HiSparkles size={16} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            Spelling Suggestions
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            <BiX size={20} />
                                        </button>
                                        <button
                                            onClick={() => onApply(correctedText)}
                                            disabled={isLoading || !correctedText || correctedText === originalText}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                                            title="Apply changes"
                                        >
                                            <BiCheck size={16} />
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-3">
                                        {corrections.map((correction, idx) => (
                                            <div key={idx} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                <span className="text-sm text-red-500 line-through decoration-red-400/50 px-1.5 py-0.5 rounded bg-red-50/50 dark:bg-red-900/10">
                                                    {correction.original}
                                                </span>
                                                <span className="text-slate-400 text-xs">→</span>
                                                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-50/50 dark:bg-emerald-900/10">
                                                    {correction.corrected}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {correctedText && corrections.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                                            <div className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed bg-slate-50/30 dark:bg-slate-800/20 p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                                                "{correctedText}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return content;
};

export default AiSpellCheckModal;
