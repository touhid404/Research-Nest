import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalApi } from "../../lib/proposalApi";
import { AiOutlinePaperClip } from "react-icons/ai";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";
import { useState } from "react";

const ProposalPostCard = ({ post }) => {
    const { user: currentUser } = useAuth();
    const { user, title, description, researchTopic, interests, attachments, createdAt } = post;

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
            // Invalidate both public and user specific lists
            queryClient.invalidateQueries({ queryKey: ["proposalPosts"] });
            if (currentUser?.uid) {
                queryClient.invalidateQueries({ queryKey: ["proposalPosts", currentUser.uid] });
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete post");
        }
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeletePost = () => {
        setIsDeleteModalOpen(true);
    }

    return (
        <div className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-3 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            {/* Decoration gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

            {/* Header: User Info */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.photoURL || "https://ui-avatars.com/api/?name=User"}
                        alt={user?.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                    />
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {user?.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                {timeAgo(createdAt)}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                            <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                                {researchTopic}
                            </span>
                        </div>
                    </div>
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
            <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">

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
                    <button className="cursor-pointer bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-5 py-2 rounded-full hover:opacity-80 active:scale-95 transition-all shadow-lg shadow-black/10 dark:shadow-white/5">
                        Request
                    </button>
                )}

                {
                    currentUser?.uid === user?.uid && (
                        <button onClick={handleDeletePost} className="cursor-pointer bg-red-600 text-white  text-sm font-semibold px-5 py-2 rounded-full hover:opacity-80 active:scale-95 transition-all shadow-lg shadow-black/10 dark:shadow-white/5">
                            Delete
                        </button>
                    )
                }




            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteMutation.mutate(post._id)}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Yes, Delete"
                isDanger={true}
            />
        </div >
    );
};

export default ProposalPostCard;