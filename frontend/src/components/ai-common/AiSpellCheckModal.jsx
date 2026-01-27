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
                <div className="absolute bottom-full mb-3 left-0 z-30 px-2 sm:px-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="relative w-full w-[200px] rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-indigo-100 dark:border-indigo-500/30 flex flex-col p-3 border-b-2 border-b-indigo-500 backdrop-blur-xl group"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2 py-1 px-2">
                                <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold animate-pulse uppercase tracking-wider">Refining...</p>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <HiSparkles className="text-indigo-500 dark:text-indigo-400 text-xs animate-pulse" />
                                        <span className="text-[9px] font-black text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest">AI Suggestion</span>
                                    </div>
                                    <p className="text-xs text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                                        {correctedText || originalText}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 self-start">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                                        title="Dismiss"
                                    >
                                        <BiX size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onApply(correctedText)}
                                        disabled={isLoading || !correctedText || correctedText === originalText}
                                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-90 disabled:opacity-50"
                                        title="Apply Changes"
                                    >
                                        <BiCheck size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return content;
};

export default AiSpellCheckModal;
