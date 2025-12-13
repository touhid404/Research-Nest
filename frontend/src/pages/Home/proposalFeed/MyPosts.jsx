import { useQuery } from "@tanstack/react-query";
import { proposalApi } from "../../../lib/proposalApi";
import { BiLoaderAlt } from "react-icons/bi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import useAuth from "../../../hooks/useAuth";
import PostLoader from "../../../components/loader/postLoader";

const MyPosts = () => {
  const { user } = useAuth();

  const { isPending, error, data } = useQuery({
    queryKey: ["proposalPosts", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return { data: [] };
      const data = await proposalApi.getAllProposalPostsByUser(user.uid);
      return data;
    },
    enabled: !!user?.uid,
  });

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

  return (
    <div className="min-h-screen pb-10">
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            You haven't created any proposals yet.
          </div>
        ) : (
          posts.map((post) => <ProposalPostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default MyPosts;
