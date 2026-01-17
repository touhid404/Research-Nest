import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoCloseOutline,
    IoPersonOutline,
    IoTimeOutline,
    IoCalendarOutline,
} from "react-icons/io5";
import { getDocumentIcon, formatSize } from "../../../utils/documentUtils.jsx";
import { formatFullTime } from "../../../utils/formatTime";

const DocumentInfoModal = ({ document, onClose }) => {
    if (!document) return null;

    const getTypeLabel = (type) => {
        const labels = {
            folder: "Folder",
            file: "File",
            notes: "Notes",
            research_paper: "Research Paper",
            outline: "Outline",
            draft: "Draft",
            other: "Document",
        };
        return labels[type] || "Document";
    };


    // Get creator name - using 'name' field from User model
    const creatorName = document.creator?.name || document.creator?.email || "Unknown User";
    const creatorInitial = creatorName.charAt(0).toUpperCase();

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-bl-full" />
                        <div className="relative flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {getDocumentIcon(document)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-8">
                                        {document.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {getTypeLabel(document.type)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-0 right-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <IoCloseOutline className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-5 space-y-4">
                        {/* Creator */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center overflow-hidden text-white font-bold text-lg">
                                {document.creator?.photoURL ? (
                                    <img src={document.creator.photoURL} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    creatorInitial
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                    Created By
                                </p>
                                <p className="font-bold text-slate-800 dark:text-white">
                                    {creatorName}
                                </p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 gap-3">
                            {/* Created At */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <IoCalendarOutline className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {formatFullTime(document.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Updated At */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <IoTimeOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Last Modified</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {formatFullTime(document.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* File Size (for files only) */}
                        {document.type === "file" && document.size && (
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm text-slate-500 dark:text-slate-400">File Size</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {formatSize(document.size)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    if (typeof window === "undefined") return null;

    return createPortal(modalContent, window.document.body);
};

export default DocumentInfoModal;
