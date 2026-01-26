import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BiCheck, BiX, BiRefresh } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";

const AiDescriptionEnhancerModal = ({
    isOpen,
    onClose,
    originalText,
    onApply,
    enhancedData,
    isLoading
}) => {
    if (typeof document === "undefined") return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-white/20 dark:border-slate-800 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl border border-indigo-500/20">
                                    <HiSparkles className="text-xl text-indigo-600 dark:text-indigo-400 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                                    AI  Enhancer
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <BiX size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 animate-[spin_3s_linear_infinite]"></div>
                                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-[spin_1s_linear_infinite]"></div>
                                        <HiSparkles className="absolute inset-0 m-auto text-2xl text-indigo-600 dark:text-indigo-400 animate-pulse" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse text-center">
                                        Refining your text with<br />academic precision...
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    {/* Original Text */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            Original
                                        </label>
                                        <div className="h-64 overflow-y-auto p-4 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {originalText}
                                        </div>
                                    </div>

                                    {/* Enhanced Text */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                                <HiSparkles /> Enhanced Result
                                            </label>
                                            {enhancedData?.changesSummary && (
                                                <div className="dropdown dropdown-end">
                                                    <label tabIndex={0} className="btn btn-ghost btn-xs h-auto min-h-0 px-2 py-1 text-xs lowercase text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                                        See changes
                                                    </label>
                                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 shadow-xl bg-white dark:bg-slate-800 rounded-xl w-64 border border-indigo-100 dark:border-slate-700 mt-2">
                                                        <h4 className="text-xs font-bold mb-2 text-gray-500 dark:text-gray-400">SUMMARY OF IMPROVEMENTS</h4>
                                                        {enhancedData.changesSummary.map((change, idx) => (
                                                            <li key={idx} className="text-xs py-1 flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                                                <div className="w-1.5 h-1.5 mt-1 rounded-full bg-indigo-500 flex-shrink-0" />
                                                                <span className="leading-tight">{change}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-64 overflow-y-auto p-4 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 text-sm text-gray-900 dark:text-gray-100 font-medium whitespace-pre-wrap leading-relaxed relative ring-1 ring-indigo-500/10">
                                            {enhancedData?.enhancedDescription || "No enhancement generated."}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button
                                onClick={onClose}
                                className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onApply(enhancedData?.enhancedDescription)}
                                disabled={isLoading || !enhancedData?.enhancedDescription}
                                className="group relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity group-hover:opacity-90" />
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] bg-[0%_0%] group-hover:bg-[100%_100%] transition-[background-position] duration-700" />
                                <div className="relative flex items-center gap-2">
                                    <BiCheck className="text-lg" />
                                    <span>Apply Changes</span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default AiDescriptionEnhancerModal;
