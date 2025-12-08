import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center w-full min-h-screen bg-white dark:bg-slate-950 p-4">
      {/* Main Container - constrained to 1300px as requested */}
      <div className="flex w-full max-w-[1300px] gap-8">
        
        {/* ================= LEFT SIDEBAR SKELETON ================= */}
        <div className="hidden md:flex flex-col w-64 flex-shrink-0 h-[calc(100vh-2rem)] sticky top-4">
          {/* Logo Placeholder */}
          <div className="h-8 w-32 bg-gray-200 dark:bg-slate-800 rounded mb-8 animate-pulse" />

          {/* Navigation Items (Simulating Home, Requests, etc.) */}
          <div className="flex-1 space-y-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center gap-4 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>

          {/* "Create Post" Button Placeholder */}

          {/* User Profile at Bottom */}
          <div className="flex items-center gap-3 animate-pulse mt-auto">
            <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* ================= CENTER CONTENT SKELETON ================= */}
        <div className="flex-1 min-w-0 pt-4">
            {/* Search Bar for Mobile (Optional visual filler) */}
            <div className="md:hidden h-10 w-full bg-gray-100 dark:bg-slate-800 rounded-full mb-6 animate-pulse" />

            {/* Simulating the Text Feed shown in your screenshot */}
            <div className="space-y-8 animate-pulse">
                
                {/* Fake Post 1 */}
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                </div>

                {/* Fake Post 2 */}
                <div className="space-y-3 pt-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-11/12" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-4/5" />
                </div>

                 {/* Fake Post 3 */}
                 <div className="space-y-3 pt-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                </div>
            </div>
        </div>

        {/* ================= RIGHT SIDEBAR SKELETON ================= */}
        <div className="hidden lg:flex flex-col w-80 flex-shrink-0 space-y-6 pt-2">
          
          {/* Search Input */}
          <div className="h-12 w-full bg-gray-100 dark:bg-slate-800 rounded-full animate-pulse" />

          {/* "Get Premium" Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-4 animate-pulse">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-10 w-32 bg-gray-300 dark:bg-slate-700 rounded-full mt-2" />
          </div>

          {/* "What's Happening" Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-6 animate-pulse">
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-slate-800 rounded mb-4" />
            
            {/* Trending Items List */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-4 bg-gray-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-4 w-full bg-gray-300 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Loader;