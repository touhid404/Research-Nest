import { Outlet, NavLink, Link, useLocation, useSearchParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import RightSidebar from "../../../components/sidebar/RightSidebar";
import { proposalApi } from "../../../lib/proposalApi";
import { HiAdjustments, HiCheck, HiX } from "react-icons/hi";
import { FaClock, FaFire, FaHistory, FaHashtag } from "react-icons/fa";


const ProposalPostsBase = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Get current filter values from URL
  const currentSortBy = searchParams.get("sortBy") || "latest";
  const currentTopic = searchParams.get("topic") || "";

  // Fetch trending topics for filter
  const { data: trendingData } = useQuery({
    queryKey: ["trendingTopics"],
    queryFn: () => proposalApi.getTrendingTopics(10),
    staleTime: 1000 * 60 * 5,
  });

  const trendingTopics = trendingData?.data || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Reset to first page on filter change
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({ page: "1" });
    setIsFilterOpen(false);
  };

  const hasActiveFilters = currentSortBy !== "latest" || currentTopic;

  const isCreatePage = location.pathname.includes("create-post");
  return (
    <div className="flex h-full">




      {/* Posts Section */}
      <div className="flex-1 border-r border-gray-100 dark:border-slate-900 overflow-y-auto custom-scrollbar">


        {/* Header with Tabs and Action */}
        <div className="sticky top-0 bg-transparent backdrop-blur-md z-40 px-4">
          <div className="flex flex-row justify-between items-center gap-4 py-2 min-h-[60px]">
            {/* Navigation Tabs */}
            <div className="flex gap-6">
              <NavLink
                to="explore"
                className={({ isActive }) =>
                  `py-2 text-sm font-semibold transition-all border-b-2 ${isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                Explore
              </NavLink>
              <NavLink
                to="for-you"
                className={({ isActive }) =>
                  `py-2 text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                For You
              </NavLink>
              <NavLink
                to="myposts"
                className={({ isActive }) =>
                  `py-2 text-sm font-semibold transition-all border-b-2 ${isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                My Posts
              </NavLink>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Filter Button */}
              {!isCreatePage && (
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all shadow-sm active:scale-95 ${
                      hasActiveFilters
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 ring-1 ring-violet-300 dark:ring-violet-700"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <HiAdjustments className="w-4 h-4" />
                    <span className="hidden md:inline">Filters</span>
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {(currentSortBy !== "latest" ? 1 : 0) + (currentTopic ? 1 : 0)}
                      </span>
                    )}
                  </button>

                  {/* Filter Dropdown */}
                  {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Filters</h3>
                        {hasActiveFilters && (
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            <HiX className="w-3 h-3" />
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Sort By Section */}
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Sort By</h4>
                        <div className="space-y-1">
                          {[
                            { value: "latest", label: "Latest", icon: FaClock },
                            { value: "oldest", label: "Oldest", icon: FaHistory },
                            { value: "popular", label: "Most Popular", icon: FaFire },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleFilterChange("sortBy", option.value === "latest" ? "" : option.value)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                currentSortBy === option.value
                                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <option.icon className="w-4 h-4" />
                              <span className="text-sm font-medium flex-1 text-left">{option.label}</span>
                              {currentSortBy === option.value && <HiCheck className="w-4 h-4 text-violet-600" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Topics Section */}
                      <div className="p-4">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FaHashtag className="w-3 h-3" />
                          Topics
                        </h4>
                        <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                          <button
                            onClick={() => handleFilterChange("topic", "")}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                              !currentTopic
                                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <span className="text-sm font-medium flex-1 text-left">All Topics</span>
                            {!currentTopic && <HiCheck className="w-4 h-4 text-violet-600" />}
                          </button>
                          {trendingTopics.map((topic) => (
                            <button
                              key={topic.name}
                              onClick={() => handleFilterChange("topic", topic.name)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                                currentTopic === topic.name
                                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <span className="text-sm font-medium flex-1 text-left">#{topic.name}</span>
                              <span className="text-xs text-slate-400">{topic.count}</span>
                              {currentTopic === topic.name && <HiCheck className="w-4 h-4 text-violet-600" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isCreatePage && (
                <Link
                  to="create-post"
                  className="bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold px-5 py-2 rounded-full hover:opacity-90 dark:hover:opacity-80 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <span className="md:hidden">+</span>
                  <span className="hidden md:inline">+ Create Post</span>
                </Link>
              )}
            </div>
          </div>
        </div>


        {/* Content Area */}
        <Outlet />
      </div>
      {/* Right Sidebar */}
      <div className="md:w-[450px] hidden lg:block shrink-0 overflow-y-auto pl-2">
        <RightSidebar />
      </div>
    </div>
  );
};


export default ProposalPostsBase;
