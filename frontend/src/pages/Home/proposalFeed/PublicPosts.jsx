import React from "react";
import { useQuery } from "@tanstack/react-query";
import { proposalApi } from "../../../lib/proposalApi";
import { BiLoaderAlt } from "react-icons/bi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import ErrorMessage from "../../../components/errors/ErrorMessage";

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
    return <PostLoader count={5} />;
  }

  if (error) {
    return (
      <ErrorMessage error={error.message} />
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
