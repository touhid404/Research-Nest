import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import { IoFolderOutline, IoClose } from "react-icons/io5";

const CreateFolderModal = ({ workspace, parentId, onClose }) => {
    const { createDocument } = useWorkspaceStore();
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            await createDocument(workspace._id, {
                title: title.trim(),
                type: "folder",
                parentId: parentId || null
            });
            onClose();
        } catch (error) {
            console.error("Failed to create folder:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
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
                    className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-white/20 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <IoFolderOutline className="w-6 h-6 text-amber-500" />
                            New Folder
                        </h3>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-sm btn-circle text-slate-500 dark:text-slate-400"
                        >
                            <IoClose className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Folder Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Project Assets"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 text-slate-900 dark:text-slate-100 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-primary shadow-lg shadow-primary/25 hover:opacity-90 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100"
                                disabled={!title.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    "Create Folder"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    if (typeof document === "undefined") return null;

    return createPortal(modalContent, document.body);
};

export default CreateFolderModal;
