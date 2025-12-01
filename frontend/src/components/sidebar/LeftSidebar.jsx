import React from "react";
import { NavLink } from "react-router";
import {
  FaHome,
  FaEnvelope,
  FaBookmark,
  FaListAlt,
  FaUser,
  FaEllipsisH,
  FaFeatherAlt,
  FaSearch,
} from "react-icons/fa";

const LeftSidebar = () => {
  const navItems = [
    { icon: <FaHome size={26} />, text: "Home", path: "/home/posts" },
    { icon: <FaListAlt size={26} />, text: "Requests", path: "/home/requests" },
    { icon: <FaBookmark size={26} />, text: "Workspace", path: "/home/workspace" },
    { icon: <FaEnvelope size={26} />, text: "Messages", path: "/home/messages" },
    { icon: <FaUser size={26} />, text: "Profile", path: "/home/my-profile" },
  ];

  return (
    <div className="sticky top-0 h-[calc(100vh-60px)] flex flex-col justify-between py-4 px-2 md:px-6 
      border-r border-gray-100 dark:border-gray-800 overflow-hidden 
      bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {/* Logo */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow">
            <span className="text-white font-extrabold text-xl">R</span>
          </div>
          <span className="hidden md:block text-2xl font-bold">ResearchNest</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 mt-2">
          {navItems.map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              className={({ isActive }) =>
                `
                  flex items-center gap-4 p-3 w-fit md:w-full rounded-full transition-all duration-200
                  ${isActive
                    ? "font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700"
                    : "text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `
              }
            >
              {item.icon}
              <span className="hidden md:block text-xl">{item.text}</span>
            </NavLink>
          ))}
        </nav>

        {/* Post Button */}
        <button className="btn bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-500 
          border-none rounded-full mt-4 w-fit md:w-full text-lg font-bold text-white min-h-[52px]">
          <span className="hidden md:block">Post</span>
          <FaFeatherAlt className="md:hidden" size={24} />
        </button>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-3 
        hover:bg-gray-100 dark:hover:bg-gray-800 
        rounded-full cursor-pointer transition-colors duration-200 mt-auto">

        <div className="avatar">
          <div className="w-10 rounded-full">
            <img
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              alt="User"
            />
          </div>
        </div>

        <div className="hidden md:flex flex-col">
          <span className="font-bold text-[12px]">Touhidul Islam...</span>
          <span className="text-gray-500 dark:text-gray-400 text-[12px]">@Touhiddev</span>
        </div>

        <FaEllipsisH className="hidden md:block ml-auto" />
      </div>

    </div>
  );
};

export default LeftSidebar;
