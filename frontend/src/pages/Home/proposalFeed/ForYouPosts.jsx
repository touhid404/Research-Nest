import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router";
import { proposalApi } from "../../../lib/proposalApi";
import ProposalPostCard from "../../../components/posts/ProposalPostCard";
import PostLoader from "../../../components/loader/PostLoader";
import ErrorMessage from "../../../components/errors/ErrorMessage";
import Pagination from "../../../components/common/Pagination";
import { HiSparkles, HiUserCircle, HiAcademicCap, HiLightBulb } from "react-icons/hi";

const LIMIT = 8;

const ProfileIncompleteCard = ({ missingFields }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-full max-w-md">
      

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Complete Your Profile for Personalized Matches
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Help us find the best research opportunities for you by adding more details to your profile.
        </p>

        {/* Missing Fields */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Add the following to unlock personalized recommendations:
          </p>
          
          {missingFields?.interests && (
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <HiLightBulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Research Interests</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add topics you're passionate about</p>
              </div>
            </div>
          )}

          {missingFields?.education && (
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <HiAcademicCap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Education</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add your institution and field of study</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link
          to="/home/my-profile"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          <HiUserCircle className="w-5 h-5" />
          Complete Your Profile
        </Link>
      </div>
    </div>
  );
};

const MatchReasonBadge = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {reasons.map((reason, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${
            reason.type === "interests"
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          }`}
        >
          {reason.type === "interests" ? (
            <HiLightBulb className="w-3 h-3" />
          ) : (
            <HiAcademicCap className="w-3 h-3" />
          )}
          {reason.type === "interests" ? "Shared Interest" : "Same Institution"}
        </span>
      ))}
    </div>
  );
};

const ForYouPosts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const {
    data,
    error,
    status,
    isPending,
  } = useQuery({
    queryKey: ["forYouPosts", currentPage],
    queryFn: async () => {
      const response = await proposalApi.getForYouPosts(currentPage, LIMIT);
      return response;
    },
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

  if (status === "error") {
    return <ErrorMessage error={error.message} />;
  }

  // Check if profile is incomplete
  if (data?.profileIncomplete) {
    return <ProfileIncompleteCard missingFields={data.missingFields} />;
  }

  const posts = data?.data || [];
  const meta = data?.meta || null;

  return (
    <div className="min-h-screen pb-10">
      <div className="p-4 pt-2">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Posts matching your interests and institution
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p className="mb-2">No matching proposals found yet.</p>
            <p className="text-sm">Check back later or explore all posts!</p>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <div key={post._id || index}>
                <MatchReasonBadge reasons={post.matchReasons} />
                <ProposalPostCard post={post} />
              </div>
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

export default ForYouPosts;
