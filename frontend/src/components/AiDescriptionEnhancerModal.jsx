import React, { useState, useEffect } from "react";
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
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal modal-open bg-black/50 backdrop-blur-sm z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="modal-box w-11/12 max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-0 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <HiSparkles className="text-xl animate-pulse" />
                            <h3 className="text-xl font-bold">AI Academic Enhancer</h3>
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20">
                            <BiX size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="loading loading-spinner loading-lg text-primary"></div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
                                    Refining your text with academic precision...
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Original Text */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Original
                                        </label>
                                    </div>
                                    <div className="h-64 overflow-y-auto p-4 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {originalText}
                                    </div>
                                </div>

                                {/* Enhanced Text */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                            Enhanced Result
                                        </label>
                                        {enhancedData?.changesSummary && (
                                            <div className="dropdown dropdown-end">
                                                <label tabIndex={0} className="btn btn-ghost btn-xs text-xs lowercase text-blue-500 hover:bg-blue-50">
                                                    See changes
                                                </label>
                                                <ul tabIndex={0} className="dropdown-content z-[1] menu p-3 shadow-xl bg-white dark:bg-slate-800 rounded-lg w-64 border border-blue-100 dark:border-blue-900">
                                                    <h4 className="text-xs font-bold mb-2 text-gray-500">SUMMARY OF IMPROVEMENTS</h4>
                                                    {enhancedData.changesSummary.map((change, idx) => (
                                                        <li key={idx} className="text-xs py-1 flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                                            <div className="w-1.5 h-1.5 mt-1 rounded-full bg-blue-500 flex-shrink-0" />
                                                            {change}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-64 overflow-y-auto p-4 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 text-sm text-gray-900 dark:text-gray-100 font-medium whitespace-pre-wrap leading-relaxed relative ring-2 ring-blue-500/10 ring-offset-0">
                                        {enhancedData?.enhancedDescription || "No enhancement generated."}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                            <button
                                onClick={onClose}
                                className="btn btn-ghost px-6 normal-case text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onApply(enhancedData?.enhancedDescription)}
                                disabled={isLoading || !enhancedData?.enhancedDescription}
                                className="btn border-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 normal-case shadow-lg shadow-blue-500/20"
                            >
                                <BiCheck className="text-xl" />
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AiDescriptionEnhancerModal;
