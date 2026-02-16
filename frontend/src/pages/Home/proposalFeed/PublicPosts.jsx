import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { proposalApi } from "../../../lib/proposalApi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import ErrorMessage from "../../../components/errors/ErrorMessage";
import Pagination from "../../../components/common/Pagination";
import { HiX } from "react-icons/hi";

const LIMIT = 8;

const PublicPosts = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get page and topic from URL params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentTopic = searchParams.get("topic") || "";

  const {
    data,
    error,
    status,
    isPending,
  } = useQuery({
    queryKey: ["proposalPosts", user?.uid, currentPage, currentTopic],
    queryFn: async () => {
      const response = await proposalApi.getAllProposalPosts(user?.uid, currentPage, LIMIT, currentTopic);
      return response;
    },
    staleTime: 1000 * 60, // 1 minute
    keepPreviousData: true, // Keep showing previous data while fetching new page
  });

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    const params = { page: newPage.toString() };
    if (currentTopic) params.topic = currentTopic;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearTopicFilter = () => {
    setSearchParams({ page: "1" });
  };

  if (isPending) {
    return <PostLoader count={5} />;
  }

  if (status === "error") {
    return <ErrorMessage error={error.message} />;
  }

  const posts = data?.data || [];
  const meta = data?.meta || null;

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

        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            {currentTopic 
              ? `No proposals found for topic "${currentTopic}".`
              : "No proposals found. Be the first to post!"
            }
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <ProposalPostCard key={post._id || index} post={post} />
            ))}

            <Pagination
              meta={meta}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              perPage={LIMIT}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PublicPosts;
