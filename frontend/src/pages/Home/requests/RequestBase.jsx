import React from "react";
import { NavLink, Outlet } from "react-router";
import RightSidebar from "../../../components/sidebar/RightSidebar";


const RequestBase = () => {
  return (
    <div className="flex h-full">
      {/* Requests Section */}
      <div className="flex-1 border-r border-gray-100 dark:border-slate-900 overflow-y-auto custom-scrollbar">


        {/* Sticky Header with Tabs */}
        <div className="sticky top-0 bg-transparent backdrop-blur-md z-20 px-4">
          <div className="flex justify-between items-end">
            <div className="flex gap-8">
              <NavLink
                to="pending"
                className={({ isActive }) =>
                  `pb-3 pt-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${isActive
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                Incoming
              </NavLink>
              <NavLink
                to="accepted"
                className={({ isActive }) =>
                  `pb-3 pt-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${isActive
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                Accepted
              </NavLink>
              <NavLink
                to="sent"
                className={({ isActive }) =>
                  `pb-3 pt-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${isActive
                    ? "border-black dark:border-white text-black dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`
                }
              >
                Sent Requests
              </NavLink>


            </div>
          </div>
        </div>


        {/* Content Area */}
        <Outlet />
      </div>


      {/* Right Sidebar */}
      <div className="md:w-[450px] hidden lg:block shrink-0 overflow-y-auto rn-scrollbar pl-2">
        <RightSidebar />
      </div>
    </div>
  );
};


export default RequestBase;