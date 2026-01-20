import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paperApi } from "../../lib/paperApi";
import { Link } from "react-router"; // Updated import
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";
import { BiLinkExternal, BiTrash, BiCalendar } from "react-icons/bi";
import { AiOutlineFilePdf } from "react-icons/ai";




const PaperCard = ({ paper }) => {
    const { user: currentUser } = useAuth();
    const { user, title, abstract, researchDomain, tags, paperLink, paperFile, createdAt, _id } = paper;




    const queryClient = useQueryClient();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);




    const deleteMutation = useMutation({
        mutationFn: (id) => paperApi.deletePaper(id),
        onSuccess: () => {
            toast.success("Paper deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["papers"] });
            if (currentUser?.uid) {
                queryClient.invalidateQueries({ queryKey: ["papers", currentUser.uid] });
            }
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete paper");
        }
    });




    const handleDelete = () => setIsDeleteModalOpen(true);




    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };




    const handleCardClick = (e) => {
        // Prevent navigation if clicking on interactive elements
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
    };


    const coAuthorsList = paper.coAuthors
        ? (Array.isArray(paper.coAuthors) ? paper.coAuthors : paper.coAuthors.split(',').map(s => s.trim()))
        : [];


    return (
        <Link
            to={`/home/paper-hub/paper/${paper._id}`}
            className="block bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
        >
            {/* Header: Meta & Date */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">
                        {researchDomain}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span>{formatDate(createdAt)}</span>
                </div>


                {currentUser?.uid === user?.uid && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete();
                        }}
                        className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 z-10 relative"
                        title="Delete Paper"
                    >
                        <BiTrash size={18} />
                    </button>
                )}
            </div>


            {/* Content */}
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {paper.title}
            </h3>


            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
                {abstract}
            </p>


            {/* Authors */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <img
                        src={user?.photoURL || "https://ui-avatars.com/api/?name=User"}
                        alt={user?.name}
                        className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-semibold">{user?.name}</span>
                </div>
                {coAuthorsList.length > 0 && (
                    <>
                        <span className="text-gray-400">,</span>
                        <span className="text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {coAuthorsList.join(", ")}
                        </span>
                    </>
                )}
            </div>


            {/* Footer: Tags & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-50 dark:border-slate-800">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {tags && tags.length > 0 && tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            #{tag}
                        </span>
                    ))}
                    {tags && tags.length > 3 && (
                        <span className="text-[10px] font-medium text-gray-400 px-1">+{tags.length - 3} more</span>
                    )}
                </div>


                {/* Quick Actions */}
                <div className="flex items-center gap-3">
                    {paperFile && (
                        <a
                            href={paperFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
                        >
                            <AiOutlineFilePdf size={16} />
                            PDF
                        </a>
                    )}
                    {paperLink && (
                        <a
                            href={paperLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition"
                        >
                            <BiLinkExternal size={14} />
                            Link
                        </a>
                    )}
                </div>
            </div>


            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteMutation.mutate(_id)}
                title="Delete Paper"
                message="Are you sure you want to delete this paper? This action cannot be undone."
                confirmText="Yes, Delete"
                isDanger={true}
            />
        </Link>
    );
};




export default PaperCard;













