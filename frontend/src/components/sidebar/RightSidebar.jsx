import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../lib/userApi";
import { proposalApi } from "../../lib/proposalApi";
import useAuth from "../../hooks/useAuth";
import { HiTrendingUp } from "react-icons/hi";
import { FiMessageCircle } from "react-icons/fi";

import { TrendingSkeleton, ResearchersSkeleton } from "../loader/RightSidebarLoader";

const RightSidebar = () => {
  const { user: currentUser } = useAuth();

  // Fetch Users
  const { data: userData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getAllUsers(),
  });

  // Fetch Proposal Posts for Trending Topics
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["proposalPosts"],
    queryFn: () => proposalApi.getAllProposalPosts(),
  });

  // Recommend Researchers
  const recommendedResearchers = useMemo(() => {
    if (!userData?.data || !currentUser) return [];
    return userData.data
      .filter(u => u.uid !== currentUser.uid)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  }, [userData, currentUser]);

  // Calculate Trending Topics
  const trendingTopics = useMemo(() => {
    if (!postsData?.data) return [];
    const interestCounts = {};
    postsData.data.forEach(post => {
      if (post.interests && Array.isArray(post.interests)) {
        post.interests.forEach(interest => {
          const normalized = interest.trim().toLowerCase();
          if (normalized) {
            interestCounts[normalized] = (interestCounts[normalized] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(interestCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [postsData]);

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-hidden w-full">
      <div className="flex flex-col gap-3 h-full overflow-hidden">

        {/* Trending Section - 50% Share */}
        <section className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-3 shrink-0">
            <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl">
              <HiTrendingUp className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-[16px] tracking-tight">
              Trending Topics
            </h2>
          </div>

          <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col gap-5">
            {postsLoading ? (
              <TrendingSkeleton />
            ) : trendingTopics.length > 0 ? (
              trendingTopics.map((topic, idx) => (
                <div key={idx} className="group/item cursor-pointer flex items-center justify-between hover:translate-x-1 transition-all duration-200 shrink-0 gap-3">
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 leading-tight truncate mr-3">
                      #{topic.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-500/80 shrink-0">
                      {topic.count.toLocaleString()} {topic.count === 1 ? 'Proposal' : 'Proposals'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">No topics found</div>
            )}
          </div>
        </section>

        {/* Top Researchers Section - 50% Share */}
        <section className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-[16px] tracking-tight">
              Top Researchers
            </h2>
            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">
              See All
            </button>
          </div>

          <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {usersLoading ? (
              <ResearchersSkeleton />
            ) : recommendedResearchers.length > 0 ? (
              recommendedResearchers.map((resUser) => (
                <div key={resUser.uid} className="flex items-center justify-between group/user shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={resUser.photoURL || `https://ui-avatars.com/api/?name=${resUser.name}&background=6366f1&color=fff&bold=true`}
                        alt={resUser.name}
                        className="w-10 h-10 rounded-full overflow-hidden ml-1 object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm transition-all group-hover/user:scale-105 group-hover/user:ring-blue-500/30"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[13.5px] text-slate-800 dark:text-slate-200 group-hover/user:text-blue-600 dark:group-hover/user:text-blue-400 transition-colors truncate">
                        {resUser.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 font-bold truncate uppercase tracking-tight">
                        {resUser.occupation || 'Researcher'}
                      </span>
                    </div>
                  </div>

                  <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 group/btn shadow-sm active:scale-95 shrink-0 ml-2">
                    <FiMessageCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">No researchers found</div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default RightSidebar;


