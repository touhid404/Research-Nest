import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalApplicationApi } from "../../lib/proposalApplicationApi";
import toast from "react-hot-toast";


const RequestModal = ({ isOpen, onClose, post }) => {
    const [description, setDescription] = useState("");
    const queryClient = useQueryClient();


    const mutation = useMutation({
        mutationFn: (data) => proposalApplicationApi.sendRequest(data),
        onSuccess: () => {
            toast.success("Request sent successfully!");
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["proposalPosts"] });
            queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
            onClose();
            setDescription("");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to send request");
            onClose();
        },
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim()) return;


        mutation.mutate({
            proposalPostId: post._id,
            description: description,
        });
    };


    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!mutation.isPending ? onClose : undefined}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-white/20 dark:border-slate-800"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Collaboration Request
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Send a request to <span className="font-bold text-blue-600 dark:text-blue-400">{post.user?.name}</span> to collaborate on <span className="italic font-medium text-gray-700 dark:text-gray-200 text-base block mt-1">"{post.title}"</span>
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="description" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    Why are you interested?
                                </label>
                                <textarea
                                    id="description"
                                    rows="4"
                                    className="w-full px-4 py-3 text-black dark:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-sm placeholder:text-slate-400"
                                    placeholder="Briefly explain your skills and why you'd be a good fit..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={mutation.isPending}
                                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending || !description.trim()}
                                    className="rounded-xl px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center gap-2"
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        "Send Request"
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


export default RequestModal;



