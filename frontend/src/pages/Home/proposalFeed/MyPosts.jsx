import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { proposalApi } from "../../../lib/proposalApi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import { useEffect, useRef } from "react";

const LIMIT = 8;

const MyPosts = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const loadMoreRef = useRef(null);

    const {
        data,
        error,
        status,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["myProposalPosts", user?.uid],
        queryFn: async ({ pageParam = 1 }) => {
            if (!user?.uid) return { data: [], meta: null };
            const response = await proposalApi.getAllProposalPostsByUser(user.uid, pageParam, LIMIT);
            return response;
        },
        enabled: !!user?.uid,
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

    if (status === "pending") {
        return <PostLoader count={5} />;
    }

    if (status === "error") {
        return (
            <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg mx-4 mt-4">
                Error loading posts: {error.message}
            </div>
        );
    }

    const allPosts = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="min-h-screen pb-10">
            <div className="p-4">
                {allPosts.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        You haven't created any proposals yet.
                    </div>
                ) : (
                    <>
                        {allPosts.map((post) => <ProposalPostCard key={post._id} post={post} />)}

                        {/* Load More Trigger */}
                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-4">
                            {isFetchingNextPage ? (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="loading loading-spinner loading-md text-blue-600"></span>
                                    <p className="text-xs text-gray-500 font-medium">Loading your posts...</p>
                                </div>
                            ) : hasNextPage ? (
                                <div className="h-10" />
                            ) : (
                                <p className="text-sm text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
                                    That's all of your posts! ✨
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyPosts;

