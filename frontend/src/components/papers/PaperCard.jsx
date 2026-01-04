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


    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">


            {/* Header: User & Meta */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={user?.photoURL || "https://ui-avatars.com/api/?name=User"}
                        alt={user?.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {user?.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <BiCalendar size={12} /> {formatDate(createdAt)}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                            <span className="uppercase font-medium tracking-wide text-blue-600 dark:text-blue-400">
                                {researchDomain}
                            </span>
                        </div>
                    </div>
                </div>


                {currentUser?.uid === user?.uid && (
                    <button
                        onClick={handleDelete}
                        className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
                        title="Delete Paper"
                    >
                        <BiTrash size={18} />
                    </button>
                )}
            </div>


            {/* Content */}
            <Link to={`/home/paper-hub/paper/${paper._id}`} className="hover:underline">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {paper.title}
                </h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                {abstract}
            </p>


            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="text-[11px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}


            {/* Actions / Links */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-50 dark:border-slate-800">
                {paperFile && (
                    <a
                        href={paperFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                    >
                        <AiOutlineFilePdf size={18} />
                        Read PDF
                    </a>
                )}


                {paperLink && (
                    <a
                        href={paperLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    >
                        <BiLinkExternal size={16} />
                        External Link
                    </a>
                )}
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
        </div>
    );
};


export default PaperCard;





