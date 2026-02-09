import React, { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { proposalApi } from "../../../lib/proposalApi";
import { BiLoaderAlt } from "react-icons/bi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import ErrorMessage from "../../../components/errors/ErrorMessage";

const LIMIT = 8;

const PublicPosts = () => {
  const { user } = useAuth();
  const observer = useRef();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["proposalPosts", user?.uid], // Include uid in queryKey to refetch on auth change
    queryFn: async ({ pageParam = 1 }) => {
      const data = await proposalApi.getAllProposalPosts(user?.uid, pageParam, LIMIT);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // Safety check: ensure lastPage and lastPage.data exist
      if (!lastPage || !lastPage.data || !Array.isArray(lastPage.data)) {
        return undefined;
      }
      return lastPage.data.length === LIMIT ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const lastPostElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  if (isPending) {
    return <PostLoader count={5} />;
  }

  if (status === "error") {
    return <ErrorMessage error={error.message} />;
  }

  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="min-h-screen pb-10">
      <div className="p-4 pt-2">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No proposals found. Be the first to post!
          </div>
        ) : (
          posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostElementRef} key={index}>
                  <ProposalPostCard post={post} />
                </div>
              );
            }
            return <ProposalPostCard key={index} post={post} />;
          })
        )}

        {isFetchingNextPage && (
          <PostLoader count={1} />
        )}
      </div>
    </div>
  );
};

export default PublicPosts;
