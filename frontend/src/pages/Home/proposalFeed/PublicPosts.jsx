import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { proposalApi } from "../../../lib/proposalApi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import ErrorMessage from "../../../components/errors/ErrorMessage";
import { HiX } from "react-icons/hi";
import { useEffect, useRef } from "react";

const LIMIT = 8;

const PublicPosts = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const loadMoreRef = useRef(null);

    // Get topic and sortBy from URL params
    const currentTopic = searchParams.get("topic") || "";
    const currentSortBy = searchParams.get("sortBy") || "latest";

    const {
        data,
        error,
        status,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["proposalPosts", user?.uid, currentTopic, currentSortBy],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await proposalApi.getAllProposalPosts(user?.uid, pageParam, LIMIT, currentTopic, currentSortBy);
            return response;
        },
        getNextPageParam: (lastPage) => {
            const meta = lastPage?.meta;
            return meta?.hasNextPage ? meta.currentPage + 1 : undefined;
        },
        staleTime: 1000 * 15,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const clearTopicFilter = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("topic");
        params.delete("page"); // Clear page param when filtering
        setSearchParams(params);
    };

    if (status === "pending") {
        return <PostLoader count={5} />;
    }

    if (status === "error") {
        return <ErrorMessage error={error.message} />;
    }

    const allPosts = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="min-h-screen pb-10">
            <div className="p-4 pt-2">
                {/* Topic Filter Badge */}
                {currentTopic && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                            Filtering by topic:
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                            #{currentTopic}
                            <button
                                onClick={clearTopicFilter}
                                className="p-0.5 hover:bg-blue-700 rounded-full transition-colors"
                                aria-label="Clear filter"
                            >
                                <HiX className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    </div>
                )}

                {allPosts.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        {currentTopic
                            ? `No proposals found for topic "${currentTopic}".`
                            : "No proposals found. Be the first to post!"
                        }
                    </div>
                ) : (
                    <>
                        {allPosts.map((post, index) => (
                            <ProposalPostCard key={post._id || index} post={post} />
                        ))}

                        {/* Load More Trigger */}
                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-4">
                            {isFetchingNextPage ? (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="loading loading-spinner loading-md text-blue-600"></span>
                                    <p className="text-xs text-gray-500 font-medium">Loading more posts...</p>
                                </div>
                            ) : hasNextPage ? (
                                <div className="h-10" /> // Transparent trigger
                            ) : (
                                <p className="text-sm text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
                                    You've caught up with everything! ✨
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PublicPosts;

