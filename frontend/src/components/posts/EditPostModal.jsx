import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSave, FaTimes, FaTrash, FaPaperclip, FaFileAlt } from "react-icons/fa";
import { BiUpload } from "react-icons/bi";
import toast from "react-hot-toast";
import { useEnhanceDescription } from "../../hooks/useEnhanceDescription";
import AiDescriptionEnhancerModal from "../ai-common/AiDescriptionEnhancerModal";
import AiEnhanceButton from "../ai-common/AiEnhanceButton";
import { HiSparkles } from "react-icons/hi";


const EditPostModal = ({ isOpen, onClose, post, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: post?.title || "",
        description: post?.description || "",
        researchTopic: post?.researchTopic || "",
        interests: post?.interests?.join(", ") || "",
    });
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [newAttachments, setNewAttachments] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    // AI state
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const enhanceMutation = useEnhanceDescription();

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                description: post.description,
                researchTopic: post.researchTopic,
                interests: post.interests?.join(", ") || "",
            });
            setExistingAttachments(post.attachments || []);
            setNewAttachments([]);
        }
    }, [post]);

    const handleEnhance = () => {
        const hasTitle = formData.title?.trim().length > 3;
        const hasTopic = formData.researchTopic?.trim().length > 3;
        const hasDesc = formData.description?.trim().length > 10;

        if (!hasTitle && !hasTopic && !hasDesc) {
            toast.error("Please provide at least a title, topic, or a short description to start the enhancement process.");
            return;
        }

        enhanceMutation.mutate(
            {
                title: formData.title,
                researchTopic: formData.researchTopic,
                description: formData.description,
                context: "proposal-update",
                tone: "academic"
            },
            {
                onSuccess: () => {
                    setIsAiModalOpen(true);
                }
            }
        );
    };

    const applyAiEnhancement = (changes) => {
        setFormData(prev => ({ ...prev, ...changes }));
        setIsAiModalOpen(false);
        toast.success("Academic refinements applied!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("researchTopic", formData.researchTopic);

            const interestsArray = formData.interests
                ? formData.interests.split(",").map((i) => i.trim()).filter(Boolean)
                : [];
            fd.append("interests", JSON.stringify(interestsArray));

            fd.append("existingAttachments", JSON.stringify(existingAttachments));

            newAttachments.forEach(file => {
                fd.append("attachments", file);
            });

            await onUpdate(post._id, fd);
            toast.success("Post updated successfully!");
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to update post");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB

        const validFiles = files.filter(file => {
            if (file.type !== "application/pdf") {
                toast.error(`${file.name} is not a PDF! Only PDFs are allowed.`);
                return false;
            }
            if (file.size > MAX_SIZE) {
                toast.error(`${file.name} is too large! Maximum limit is 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setNewAttachments(prev => [...prev, ...validFiles]);
        }
    };

    const removeExistingAttachment = (index) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewAttachment = (index) => {
        setNewAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Proposal Post</h2>

                                <button
                                    type="button"
                                    onClick={handleEnhance}
                                    disabled={enhanceMutation.isPending}
                                    className="flex items-center cursor-pointer gap-1.5 text-xs font-semibold py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {enhanceMutation.isPending ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <HiSparkles className="text-sm group-hover:rotate-12 transition-transform" />
                                    )}
                                    Enhance with AI
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400 dark:text-gray-500 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                        placeholder="Post Title"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Research Topic</label>
                                    <input
                                        type="text"
                                        name="researchTopic"
                                        value={formData.researchTopic}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                        placeholder="Research Area"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between ml-1 mb-0.5">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white min-h-[100px]"
                                        placeholder="Describe your research proposal..."
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Interests (comma separated)</label>
                                    <input
                                        type="text"
                                        name="interests"
                                        value={formData.interests}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black dark:text-white"
                                        placeholder="ML, AI, Ethics"
                                    />
                                </div>

                                {/* Attachments Management */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attachments</label>
                                        <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors text-xs font-bold text-slate-600 dark:text-slate-300">
                                            <BiUpload size={16} />
                                            <span>Add Attachments</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Existing Attachments */}
                                        {existingAttachments.map((file, idx) => (
                                            <div key={`existing-${idx}`} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FaFileAlt className="text-slate-400 shrink-0" />
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingAttachment(idx)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Attachments */}
                                        {newAttachments.map((file, idx) => (
                                            <div key={`new-${idx}`} className="flex items-center justify-between p-2.5 bg-blue-50/20 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-xl animate-in fade-in slide-in-from-left-2 duration-300">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FaPaperclip className="text-blue-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate block">{file.name}</span>
                                                        <span className="text-[10px] text-blue-400 uppercase font-bold tracking-tighter">New Upload</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewAttachment(idx)}
                                                    className="p-1.5 text-blue-400 hover:text-red-500 transition-colors"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        {existingAttachments.length === 0 && newAttachments.length === 0 && (
                                            <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                                <p className="text-xs text-slate-400 font-medium">No attachments yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-post-form"
                                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FaSave /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            <AiDescriptionEnhancerModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                originalData={{
                    title: formData.title,
                    researchTopic: formData.researchTopic,
                    description: formData.description
                }}
                enhancedData={enhanceMutation.data}
                isLoading={enhanceMutation.isPending}
                onApply={applyAiEnhancement}
            />
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};

export default EditPostModal;
