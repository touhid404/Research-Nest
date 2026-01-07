import React from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { proposalApi } from "../../../lib/proposalApi";
import { BiChevronLeft } from "react-icons/bi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import PostLoader from "../../../components/loader/postLoader";
import ErrorMessage from "../../../components/errors/ErrorMessage";

const PostDetails = () => {
    const { id } = useParams();

    const { isPending, error, data } = useQuery({
        queryKey: ["proposalPost", id],
        queryFn: () => proposalApi.getProposalPostById(id),
    });

    if (isPending) {
        return (
            <div className="p-4 pt-6 max-w-4xl mx-auto">
                <PostLoader count={1} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 pt-6 max-w-4xl mx-auto">
                <ErrorMessage error={error.message} />
            </div>
        );
    }

    const post = data?.data;

    if (!post) {
        return (
            <div className="p-4 pt-12 text-center max-w-4xl mx-auto">
                <div className="text-gray-300 dark:text-slate-700 mb-4 text-7xl">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Post Not Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">This post may have been deleted or is no longer available.</p>
                <Link
                    to="/home/posts/explore"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    Back to Explore
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12">
            <div className="p-4 pt-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-semibold group"
                    >
                        <div className="p-1 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                            <BiChevronLeft size={24} />
                        </div>
                        Back
                    </button>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProposalPostCard post={post} />
                </div>
            </div>
        </div>
    );
};

export default PostDetails;
