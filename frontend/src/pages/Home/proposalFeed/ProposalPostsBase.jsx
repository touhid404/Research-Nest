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
