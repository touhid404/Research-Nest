import React from "react";
import { useQuery } from "@tanstack/react-query";
import { proposalApi } from "../../../lib/proposalApi";
import { BiLoaderAlt } from "react-icons/bi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";

const PublicPosts = () => {
    const { user } = useAuth();
    const { isPending, error, data } = useQuery({
        queryKey: ["proposalPosts", user?.uid], // Include uid in queryKey to refetch on auth change
        queryFn: async () => {
            const data = await proposalApi.getAllProposalPosts(user?.uid);
            return data;
        },
    });

    if (isPending) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <BiLoaderAlt className="animate-spin text-3xl text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg mx-4 mt-4">
                Error loading posts: {error.message}
            </div>
        );
    }

    const posts = data?.data || [];

    return (
        <div className="min-h-screen pb-10">
            <div className="p-4 pt-2">
                {posts.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        No proposals found. Be the first to post!
                    </div>
                ) : (
                    posts.map((post) => <ProposalPostCard key={post._id} post={post} />)
                )}
            </div>
        </div>
    );
};

export default PublicPosts;