import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { proposalApi } from "../../../lib/proposalApi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import ErrorMessage from "../../../components/errors/ErrorMessage";
import Pagination from "../../../components/common/Pagination";

const LIMIT = 8;

const PublicPosts = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get page from URL params, default to 1
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const {
    data,
    error,
    status,
    isPending,
  } = useQuery({
    queryKey: ["proposalPosts", user?.uid, currentPage],
    queryFn: async () => {
      const response = await proposalApi.getAllProposalPosts(user?.uid, currentPage, LIMIT);
      return response;
    },
    staleTime: 1000 * 60, // 1 minute
    keepPreviousData: true, // Keep showing previous data while fetching new page
  });

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No proposals found. Be the first to post!
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
