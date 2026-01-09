import { Outlet, NavLink, Link, useLocation } from "react-router";
import RightSidebar from "../../../components/sidebar/RightSidebar";


const ProposalPostsBase = () => {
   const location = useLocation();


  const isCreatePage = location.pathname.includes("create-post");
  return (
    <div className="flex h-full">




      {/* Posts Section */}
      <div className="flex-1 border-r border-gray-100 dark:border-slate-900 overflow-y-auto custom-scrollbar">


        {/* Header with Tabs and Action */}
        <div className="sticky top-0 bg-transparent backdrop-blur-md z-10 px-4">
          <div className="flex justify-between items-end">
            {/* Navigation Tabs */}
            <div className="flex gap-8">
              <NavLink
                to="explore"
                className={({ isActive }) =>
                  `pb-3 pt-4 text-sm font-medium transition-colors border-b-2  ${isActive
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                Explore
              </NavLink>
              <NavLink
                to="myposts"
                className={({ isActive }) =>
                  `pb-3 pt-4 text-sm font-medium transition-colors border-b-2  ${isActive
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                My Posts
              </NavLink>
            </div>


            {!isCreatePage && (
              <Link
                to="create-post"
                className="bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-1.5 rounded-full hover:opacity-80 transition-all shadow-lg active:scale-95 cursor-pointer mb-2"
              >
                + Create Post
              </Link>
            )}
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
