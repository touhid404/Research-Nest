import React from "react";
import { Link, NavLink } from "react-router";
import {
  FaHome,
  FaEnvelope,
  FaBookmark,
  FaListAlt,
  FaUser,
  FaEllipsisH,
  FaFeatherAlt,
  FaSearch,
  FaBell,
  FaNewspaper,
} from "react-icons/fa";

const LeftSidebar = () => {
  const navItems = [
    { icon: <FaHome size={22} />, text: "Home", path: "/home/posts" },
    { icon: <FaListAlt size={22} />, text: "Requests", path: "/home/requests" },
    { icon: <FaBookmark size={22} />, text: "Workspace", path: "/home/workspace" },
    { icon: <FaEnvelope size={22} />, text: "Messages", path: "/home/messages" },

    { icon: <FaNewspaper size={22} />, text: "Paper Hub", path: "/home/paper-hub" },
    { icon: <FaBell size={22} />, text: "Notifications", path: "/home/notifications" },
  ];

  return (
    <div
      className="
        sticky top-0 h-[calc(100vh-80px)] 
        flex flex-col justify-between
        py-3 px-3 md:px-5 
        border-r border-gray-100 dark:border-gray-800 
        bg-white dark:bg-gray-900 
        text-gray-900 dark:text-gray-100
      "
    >
      <div className="flex flex-col gap-2">

        {/* Navigation */}
        <nav className="flex flex-col gap-2 mt-5">
          {navItems.map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              className={({ isActive }) =>
                `
                flex items-center gap-3
                py-2 px-3 w-fit md:w-full rounded-full
                transition-all duration-200 text-lg

                ${isActive
                  ? "font-bold text-black  dark:text-white"
                  : "text-gray-800 font-normal dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}
                `
              }
            >
              {item.icon}
              <span className="hidden md:block">{item.text}</span>
            </NavLink>
          ))}
        </nav>

        {/* Post Button */}
        <button
          className="
            bg-black hover:bg-gray-800 
            dark:bg-blue-600 dark:hover:bg-blue-500
            border-none rounded-full mt-3
            w-fit md:w-full text-[15px] font-bold text-white 
            min-h-[45px] flex items-center justify-center gap-2 px-4
          "
        >
          <span className="hidden md:block">Create Post</span>
          <FaFeatherAlt className="md:hidden" size={20} />
        </button>
      </div>

      {/* User Card */}
      <Link to="/home/my-profile"
        className="
          flex items-center gap-3 p-2 
        bg-gray-100 dark:bg-gray-800 
          rounded-full cursor-pointer transition-colors duration-200 mt-auto
        "
      >
        <div className="avatar">
          <div className="w-9 rounded-full">
            <img
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              alt="User"
            />
          </div>
        </div>

        <div className="hidden md:flex flex-col text-sm leading-tight">
          <span className="font-bold text-[13px]">Touhidul Islam...</span>
          <span className="text-gray-500 dark:text-gray-400 text-[11px]">@Touhiddev</span>
        </div>

      </Link>
    </div>
  );
};

export default LeftSidebar;
