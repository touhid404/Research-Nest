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

    // A helper to render the text with inline corrections
    const renderInlineCorrections = () => {
        if (!originalText || !correctedText) return null;

        if (corrections.length === 0) {
            return <span className="text-gray-700 dark:text-gray-300">{correctedText}</span>;
        }

        let displayElements = [];
        const sortedCorrections = [...corrections].sort((a, b) => {
            return originalText.indexOf(a.original) - originalText.indexOf(b.original);
        });

        let lastIndex = 0;
        sortedCorrections.forEach((corr, i) => {
            const index = originalText.indexOf(corr.original, lastIndex);
            if (index !== -1) {
                displayElements.push(
                    <span key={`text-${i}`} className="text-gray-700 dark:text-gray-200">
                        {originalText.substring(lastIndex, index)}
                    </span>
                );
                displayElements.push(
                    <span key={`corr-${i}`} className="inline-flex flex-wrap items-center gap-1 mx-1">
                        <span className="text-red-500 line-through decoration-red-400/60 font-medium">
                            {corr.original}
                        </span>
                        <span className="text-green-700 dark:text-green-400 font-bold">
                            {corr.corrected}
                        </span>
                    </span>
                );
                lastIndex = index + corr.original.length;
            }
        });

        if (lastIndex < originalText.length) {
            displayElements.push(
                <span key="text-end" className="text-gray-700 dark:text-gray-200">
                    {originalText.substring(lastIndex)}
                </span>
            );
        }

        return displayElements;
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute bottom-full mb-3 left-0 z-50 w-full sm:w-[400px]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative rounded-[20px] bg-white dark:bg-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isLoading ? (
                            <div className="p-5 flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">Checking...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between px-5 py-3">
                                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                                        Use the right words
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onApply(correctedText)}
                                            disabled={isLoading || !correctedText || correctedText === originalText}
                                            className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-[13px] font-bold rounded-lg shadow-[0_4px_10px_rgba(92,69,253,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                        >
                                            Correct it
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            <BiX size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-4 py-2 pb-5 min-h-[50px] flex items-center flex-wrap gap-y-1.5 leading-relaxed text-[15px]">
                                    {renderInlineCorrections()}
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
