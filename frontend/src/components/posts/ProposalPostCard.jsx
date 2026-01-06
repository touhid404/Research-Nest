import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalApi } from "../../lib/proposalApi";
import { AiOutlinePaperClip } from "react-icons/ai";
import { BiDotsVerticalRounded, BiShareAlt, BiTrash, BiEditAlt, BiCheckCircle } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";
import RequestModal from "./RequestModal";
import EditPostModal from "./EditPostModal";

const ProposalPostCard = ({ post }) => {
    const { user: currentUser } = useAuth();
    const { user, title, description, researchTopic, interests, attachments, createdAt, status, _id } = post;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return "Just now";
    };

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id) => proposalApi.deleteProposalPost(id),
        onSuccess: () => {
            toast.success("Post deleted successfully");
            invalidatePosts();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete post");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => proposalApi.updateProposalPost(id, data),
        onSuccess: () => {
            invalidatePosts();
            setIsMenuOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update post");
        }
    });

    const invalidatePosts = () => {
        queryClient.invalidateQueries({ queryKey: ["proposalPosts"] });
        if (currentUser?.uid) {
            queryClient.invalidateQueries({ queryKey: ["proposalPosts", currentUser.uid] });
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/home/posts/explore`; // Simplified for now
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        setIsMenuOpen(false);
    };

    const toggleStatus = () => {
        const nextStatus = status === "group_formed" ? "published" : "group_formed";
        updateMutation.mutate({ id: _id, data: { status: nextStatus } });
    };

    return (
        <div className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-3 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            {/* Decoration gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

            {/* Header: User Info */}
            <div className="flex justify-between items-start mb-3 relative z-20">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.photoURL || "https://ui-avatars.com/api/?name=User"}
                        alt={user?.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                    />
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                            {user?.name}
                            {user?.isVerified && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" fill="none" viewBox="0 0 24 24" className="text-[#0081f5] grow-0 shrink-0">
                                    <path fill="currentColor" fillRule="evenodd" d="M9.592 3.2c-.243.208-.365.312-.495.399-.298.2-.633.338-.985.408-.153.03-.313.043-.632.068-.801.064-1.202.096-1.536.214a2.713 2.713 0 0 0-1.655 1.655c-.118.334-.15.735-.214 1.536-.025.319-.038.479-.068.632-.07.352-.208.687-.408.985-.087.13-.191.252-.399.495-.521.612-.782.918-.935 1.238-.353.74-.353 1.6 0 2.34.153.32.414.626.935 1.238.208.243.312.365.399.495.2.298.338.633.408.985.03.153.043.313.068.632.064.801.096 1.202.214 1.536a2.713 2.713 0 0 0 1.655 1.655c.334.118.735.15 1.536.214.319.025.479.038.632.068.352.07.687.209.985.408.13.087.252.191.495.399.612.521.918.782 1.238.935.74.353 1.6.353 2.34 0 .32-.153.626-.414 1.238-.935.243-.208.365-.312.495-.399.298-.2.633-.338.985-.408.153-.03.313-.043.632-.068.801-.064 1.202-.096 1.536-.214a2.713 2.713 0 0 0 1.655-1.655c.118-.334.15-.735.214-1.536.025-.319.038-.479.068-.632.07-.352.209-.687.408-.985.087-.13.191-.252.399-.495.521-.612.782-.918.935-1.238.353-.74.353-1.6 0-2.34-.153-.32-.414-.626-.935-1.238-.208-.243-.312-.365-.399-.495a2.713 2.713 0 0 1-.408-.985 5.72 5.72 0 0 1-.068-.632c-.064-.801-.096-1.202-.214-1.536a2.713 2.713 0 0 0-1.655-1.655c-.334-.118-.735-.15-1.536-.214-.319-.025-.479-.038-.632-.068a2.713 2.713 0 0 1-.985-.408 5.73 5.73 0 0 1-.495-.399c-.612-.521-.918-.782-1.238-.935a2.713 2.713 0 0 0-2.34 0c-.32.153-.626.414-1.238.935Zm6.781 6.663a.814.814 0 0 0-1.15-1.15l-4.85 4.85-1.596-1.595a.814.814 0 0 0-1.15 1.15l2.17 2.17a.814.814 0 0 0 1.15 0l5.427-5.425Z" clipRule="evenodd"></path>
                                </svg>
                            )}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                            <div className="relative group/time">
                                <span className="cursor-pointer group-hover/time:underline text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-default">
                                    {timeAgo(createdAt)}
                                </span>

                                {/* Custom Tooltip */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover/time:opacity-100 pointer-events-none transition-all duration-200 translate-y-2 group-hover/time:translate-y-0 z-[10]">
                                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-white/10 dark:border-slate-200 flex items-center gap-2">
                                        {(() => {
                                            const d = new Date(createdAt);
                                            const day = d.getDate();
                                            const month = d.toLocaleString('en-US', { month: 'long' });
                                            const year = d.getFullYear();
                                            const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                            return `${day} ${month}, ${year} at ${time}`;
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                            <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                {researchTopic}
                            </span>
                            {status === "group_formed" && (
                                <span className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-green-100 dark:border-green-800/30">
                                    Group Formed
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all active:scale-95"
                    >
                        <BiDotsVerticalRounded size={22} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-40 overflow-hidden"
                                >
                                    {currentUser?.uid === user?.uid ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsEditModalOpen(true);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-semibold flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 transition-colors"
                                            >
                                                <BiEditAlt size={18} className="text-blue-500" />
                                                Edit Post
                                            </button>
                                            <button
                                                onClick={() => {
                                                    toggleStatus();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-semibold flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 transition-colors"
                                            >
                                                <BiCheckCircle size={18} className="text-green-500" />
                                                {status === "group_formed" ? "Mark as Open" : "Mark as Completed"}
                                            </button>
                                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-1 mx-2" />
                                            <button
                                                onClick={() => {
                                                    setIsDeleteModalOpen(true);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm font-semibold flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                            >
                                                <BiTrash size={18} />
                                                Delete Post
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleCopyLink}
                                            className="w-full px-4 py-2.5 text-left text-sm font-semibold flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-200 transition-colors"
                                        >
                                            <BiShareAlt size={18} className="text-indigo-500" />
                                            Copy Post Link
                                        </button>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Body */}
            <div className="mb-3">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 leading-tight">
                    {title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-[15px] leading-relaxed line-clamp-3">
                    {description}
                </p>
            </div>

            {/* Attachments Section */}
            {attachments && attachments.length > 0 && (
                <div className="mb-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AiOutlinePaperClip className="text-gray-500 dark:text-gray-400" size={18} />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Attachments
                        </span>
                    </div>

                    <div className="space-y-2">
                        {attachments.map((file, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2"
                            >
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
                                    {file.name}
                                </span>

                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    View
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-20">
                {/* Interests */}
                <div className="flex flex-wrap gap-2">
                    {interests?.slice(0, 3).map((interest, index) => (
                        <span
                            key={index}
                            className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-gray-100 dark:border-slate-700/50"
                        >
                            #{interest}
                        </span>
                    ))}
                    {interests && interests.length > 3 && (
                        <span className="text-[11px] font-medium text-gray-400 px-1 py-1">
                            +{interests.length - 3}
                        </span>
                    )}
                </div>

                {currentUser?.uid !== user?.uid && (
                    <button
                        onClick={() => !post.hasApplied && setIsRequestModalOpen(true)}
                        disabled={status === "group_formed" || post.hasApplied}
                        className={`text-sm font-semibold px-5 py-2 rounded-full active:scale-95 transition-all shadow-lg shadow-black/10 dark:shadow-white/5 flex items-center gap-2 shrink-0 ${status === "group_formed" || post.hasApplied
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80 cursor-pointer"
                            }`}
                    >
                        {status === "group_formed" ? (
                            "Full"
                        ) : post.hasApplied ? (
                            <>
                                <FiSend size={15} className="text-gray-400 dark:text-gray-500" />
                                <span>Sent Request</span>
                            </>
                        ) : (
                            "Request"
                        )}
                    </button>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteMutation.mutate(_id)}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Yes, Delete"
                isDanger={true}
            />

            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
                onUpdate={(id, data) => updateMutation.mutateAsync({ id, data })}
            />

            <RequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                post={post}
            />
        </div>
    );
};

export default ProposalPostCard;