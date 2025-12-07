import { NavLink } from "react-router";

import {
  FaHome,
  FaListAlt,
  FaBookmark,
  FaEnvelope,
  FaNewspaper,
  FaUser,
  FaBell,
  FaBars,
  FaFeatherAlt,
} from "react-icons/fa";

const LeftSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navItems = [
    { icon: <FaHome size={22} />, text: "Home", path: "/home/posts" }, // Home
    { icon: <FaListAlt size={22} />, text: "Requests", path: "/home/requests" }, // Requests / Tasks
    {
      icon: <FaBookmark size={22} />,
      text: "Workspace",
      path: "/home/workspace",
    }, // Workspace / Saved
    {
      icon: <FaEnvelope size={22} />,
      text: "Messages",
      path: "/home/messages",
    }, // Messages / Inbox
    {
      icon: <FaNewspaper size={22} />,
      text: "Paper Hub",
      path: "/home/paper-hub",
    }, // News / Papers
    {
      icon: <FaUser size={22} />,
      text: "My Profile",
      path: "/home/my-profile",
    }, // Profile
    {
      icon: <FaBell size={22} />,
      text: "Notifications",
      path: "/home/notifications",
    }, // Notifications
  ];

  return (
    <div
      className="
        sticky top-0 h-[calc(100vh-80px)]
        flex flex-col justify-between
        border-r border-gray-100 dark:border-slate-900
        bg-white dark:bg-slate-950 transition-colors duration-500 py-3 px-2
      "
    >
      {/* Navigation + Menu button ON SAME LINE */}
      <div className="flex flex-col gap-1">
        {/** FaBars icon appears as a nav item now **/}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            flex items-center gap-3 py-2 px-3 rounded-full
            hover:bg-gray-200 dark:hover:bg-gray-700 
          "
        >
          <FaBars size={22} />
          {!isCollapsed && <span className="text-[15px]">Menu</span>}
        </button>

        {/* REAL NAV ITEMS */}
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center gap-3 py-2 px-3 rounded-full
              hover:bg-gray-200 dark:hover:bg-gray-700

              ${
                isActive
                  ? "font-bold "
                  : ""
              }
              `
            }
          >
            {item.icon}
            {!isCollapsed && <span className="text-[15px]">{item.text}</span>}
          </NavLink>
        ))}
      </div>

      {/* Create Post Button */}
      <button
        className={`
          bg-black dark:bg-blue-600 text-white font-semibold
          rounded-full min-h-[45px] mt-3 transition-all duration-300
          flex items-center justify-center gap-2
          ${isCollapsed ? "w-[45px]" : "w-full px-4"}
        `}
      >
        {isCollapsed ? <FaFeatherAlt size={20} /> : "Create Post"}
      </button>

      {/* User Profile */}
      <div
        className="
          flex items-center gap-3 p-2 
          bg-gray-100 dark:bg-gray-800 rounded-full 
          cursor-pointer transition mt-5
        "
      >
        <div className="avatar">
          <div className="w-9 rounded-full">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex flex-col text-sm">
            <span className="font-bold text-[13px]">Touhidul Islam...</span>
            <span className="text-gray-500 text-[11px]">@Touhiddev</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
