import { useQuery } from "@tanstack/react-query";
import { paperApi } from "../../../lib/paperApi";
import PaperCard from "../../../components/papers/PaperCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import { useSearchParams } from "react-router";
import { BiSearch } from "react-icons/bi";
import Pagination from "../../../components/common/Pagination";

const LIMIT = 10;

const MyPapers = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get current params from URL
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const searchQuery = searchParams.get("q") || "";
    const selectedSort = searchParams.get("sort") || "newest";
    const domains = searchParams.get("domains") || "";
    const yearFrom = searchParams.get("yearFrom") || "";
    const yearTo = searchParams.get("yearTo") || "";
    const hasPdf = searchParams.get("hasPdf") || "";
    const hasLink = searchParams.get("hasLink") || "";

    const { isPending, error, data, isPlaceholderData } = useQuery({
        queryKey: ["papers", user?.uid, "my-papers", currentPage, searchQuery, selectedSort, domains, yearFrom, yearTo, hasPdf, hasLink],
        queryFn: async () => {
            if (!user?.uid) return { data: [], meta: null };
            return await paperApi.getAllPapersByUser(user.uid, currentPage, LIMIT, {
                q: searchQuery,
                sort: selectedSort,
                domains,
                yearFrom,
                yearTo,
                hasPdf,
                hasLink
            });
        },
        enabled: !!user?.uid,
        placeholderData: (previousData) => previousData,
    });

    const handlePageChange = (newPage) => {
        if (newPage < 1) return;
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (isPending) return <PostLoader count={5} />;

    if (error) {
        return (
            <div className="text-center py-20 text-red-500 bg-red-50/50 dark:bg-red-900/10 rounded-2xl m-5">
                <p className="font-bold">Error loading your papers</p>
                <p className="text-sm opacity-80">{error.message}</p>
            </div>
        );
    }

    const papers = data?.data || [];
    const meta = data?.meta || null;

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

            {papers.length === 0 ? (
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
                <div className={isPlaceholderData ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
                    <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800/50">
                        {papers.map((paper) => (
                            <PaperCard key={paper._id} paper={paper} />
                        ))}
                    </div>

                    <Pagination
                        meta={meta}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        perPage={LIMIT}
                    />
                </div>
            )}
        </div>
    );
};


export default MyPapers;
