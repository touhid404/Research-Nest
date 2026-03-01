import { useInfiniteQuery } from "@tanstack/react-query";
import { paperApi } from "../../../lib/paperApi";
import PaperCard from "../../../components/papers/PaperCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import { useSearchParams } from "react-router";
import { BiSearch } from "react-icons/bi";
import { useEffect, useRef } from "react";

const LIMIT = 10;

const MyPapers = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const loadMoreRef = useRef(null);

    // Get current params from URL
    const searchQuery = searchParams.get("q") || "";
    const selectedSort = searchParams.get("sort") || "newest";
    const domains = searchParams.get("domains") || "";
    const yearFrom = searchParams.get("yearFrom") || "";
    const yearTo = searchParams.get("yearTo") || "";
    const hasPdf = searchParams.get("hasPdf") || "";
    const hasLink = searchParams.get("hasLink") || "";

    const {
        data,
        error,
        status,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["papers", user?.uid, "my-papers", searchQuery, selectedSort, domains, yearFrom, yearTo, hasPdf, hasLink],
        queryFn: async ({ pageParam = 1 }) => {
            if (!user?.uid) return { data: [], meta: null };
            return await paperApi.getAllPapersByUser(user.uid, pageParam, LIMIT, {
                q: searchQuery,
                sort: selectedSort,
                domains,
                yearFrom,
                yearTo,
                hasPdf,
                hasLink
            });
        },
        getNextPageParam: (lastPage) => {
            const meta = lastPage?.meta;
            return meta?.hasNextPage ? meta.currentPage + 1 : undefined;
        },
        enabled: !!user?.uid,
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

    if (status === "pending") return <PostLoader count={5} />;

    if (status === "error") {
        return (
            <div className="text-center py-20 text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl m-5">
                <p className="font-bold">Error loading your papers</p>
                <p className="text-sm opacity-80">{error.message}</p>
            </div>
        );
    }

    const allPapers = data?.pages.flatMap((page) => page.data) || [];
    const meta = data?.pages[0]?.meta || null;

    return (
        <div className="pb-10 px-5 pt-3 animate-in fade-in duration-500">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4 py-1 border-b border-slate-100 dark:border-slate-800/50">
                <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                    {meta?.totalCount ? (
                        <>
                            You have published <span className="text-blue-600 dark:text-blue-400 font-bold">{meta.totalCount}</span> papers
                        </>
                    ) : (
                        "You haven't published any papers yet"
                    )}
                </p>
            </div>

            {allPapers.length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                        <BiSearch size={32} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 font-semibold text-[15px]">
                            No papers found.
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Share your research with the community!</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800/50">
                        {allPapers.map((paper) => (
                            <PaperCard key={paper._id} paper={paper} />
                        ))}
                    </div>

                    {/* Load More Trigger */}
                    <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-6">
                        {isFetchingNextPage ? (
                            <div className="flex flex-col items-center gap-2">
                                <span className="loading loading-spinner loading-md text-blue-600"></span>
                                <p className="text-xs text-gray-500 font-medium">Loading more papers...</p>
                            </div>
                        ) : hasNextPage ? (
                            <div className="h-10" /> // Transparent trigger
                        ) : (
                            <p className="text-[11px] text-gray-400 font-bold bg-gray-50 dark:bg-gray-800/50 px-5 py-2 rounded-full border border-gray-100 dark:border-gray-700 uppercase tracking-wider">
                                You've reached the end of your papers ✨
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyPapers;

