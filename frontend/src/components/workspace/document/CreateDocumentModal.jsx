import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoCloseOutline,
    IoDocumentTextOutline,
    IoReaderOutline,
    IoListOutline,
    IoCreateOutline,
} from "react-icons/io5";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";

const documentTypes = [
    { value: "notes", label: "Notes", icon: IoReaderOutline, color: "violet", description: "Quick notes and ideas" },
    { value: "research_paper", label: "Research Paper", icon: IoDocumentTextOutline, color: "blue", description: "Formal research document" },
    { value: "outline", label: "Outline", icon: IoListOutline, color: "emerald", description: "Document structure" },
    { value: "draft", label: "Draft", icon: IoCreateOutline, color: "amber", description: "Work in progress" },
];

const CreateDocumentModal = ({ workspace, parentId, onClose, isOpen = true }) => {
    const { createDocument } = useWorkspaceStore();
    const [title, setTitle] = useState("");
    const [type, setType] = useState("research_paper");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Document title is required");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await createDocument(workspace._id, {
                title: title.trim(),
                type,
                parentId: parentId || null,
                plainText: "",
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create document");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedType = documentTypes.find(t => t.value === type);

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-violet-500/10 to-purple-500/10 rounded-bl-full" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                                        <IoDocumentTextOutline className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Create Document</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Add a new document to workspace</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <IoCloseOutline className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 pb-6 space-y-5">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                        Document Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter document title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                                        autoFocus
                                    />
                                </div>

                                {/* Document Type Selection */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                                        Document Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {documentTypes.map((docType) => {
                                            const Icon = docType.icon;
                                            const isSelected = type === docType.value;
                                            return (
                                                <button
                                                    key={docType.value}
                                                    type="button"
                                                    onClick={() => setType(docType.value)}
                                                    className={`p-3 rounded-xl border-2 transition-all text-left ${isSelected
                                                        ? `border-${docType.color}-500 bg-${docType.color}-50 dark:bg-${docType.color}-900/20`
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`w-4 h-4 ${isSelected ? `text-${docType.color}-500` : "text-slate-400"}`} />
                                                        <span className={`text-sm font-medium ${isSelected ? "text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>
                                                            {docType.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">{docType.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !title.trim()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Document"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;

    return createPortal(modalContent, document.body);
};

export default CreateDocumentModal;

