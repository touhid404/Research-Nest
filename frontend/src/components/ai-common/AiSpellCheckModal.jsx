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
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Use the right word</span>
                                    <button
                                        onClick={onClose}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <BiX size={20} />
                                    </button>
                                </div>

                                <div className="p-4 bg-white dark:bg-slate-900">
                                    <div className="text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 flex flex-wrap gap-x-1.5 items-baseline">
                                        {(() => {
                                            if (!corrections || corrections.length === 0) return correctedText || originalText;

                                            let result = [];
                                            let lastIndex = 0;
                                            const text = originalText;

                                            const sorted = [...corrections].sort((a, b) => text.indexOf(a.original) - text.indexOf(b.original));

                                            sorted.forEach((corr, i) => {
                                                const start = text.indexOf(corr.original, lastIndex);
                                                if (start !== -1) {
                                                    // Text before
                                                    if (start > lastIndex) {
                                                        result.push(<span key={`pre-${i}`}>{text.substring(lastIndex, start)}</span>);
                                                    }
                                                    // The diff
                                                    result.push(
                                                        <span key={`diff-${i}`} className="inline-flex gap-1.5 items-baseline">
                                                            <span className="text-red-600 line-through decoration-red-600/60 font-medium">
                                                                {corr.original}
                                                            </span>
                                                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                                                {corr.corrected}
                                                            </span>
                                                        </span>
                                                    );
                                                    lastIndex = start + corr.original.length;
                                                }
                                            });
                                            // Remaining text
                                            if (lastIndex < text.length) {
                                                result.push(<span key="post">{text.substring(lastIndex)}</span>);
                                            }
                                            return result;
                                        })()}
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => onApply(correctedText)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                                        >
                                            Correct it
                                        </button>
                                    </div>
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
