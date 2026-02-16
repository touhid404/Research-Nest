import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { proposalApi } from "../../../lib/proposalApi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/PostLoader";
import Pagination from "../../../components/common/Pagination";

const LIMIT = 8;

const MyPosts = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const { isPending, error, data } = useQuery({
    queryKey: ["myProposalPosts", user?.uid, currentPage],
    queryFn: async () => {
      if (!user?.uid) return { data: [], meta: null };
      const response = await proposalApi.getAllProposalPostsByUser(user.uid, currentPage, LIMIT);
      return response;
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 15, // 15 seconds - shorter for fresher data
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isPending) {
    return <PostLoader count={5} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg mx-4 mt-4">
        Error loading posts: {error.message}
      </div>
    );
  }

  const posts = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen pb-10">
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            You haven't created any proposals yet.
          </div>
        ) : (
          <>
            {posts.map((post) => <ProposalPostCard key={post._id} post={post} />)}
            
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

export default MyPosts;
