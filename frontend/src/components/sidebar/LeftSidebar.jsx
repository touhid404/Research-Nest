import { NavLink, useNavigate } from "react-router";
import { useState } from "react";

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
import useAuth from "../../hooks/useAuth";

const LeftSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { icon: <FaHome size={22} />, text: "Posts", path: "/home/posts" }, // Home
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

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsLogoutModalOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
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
 
              ${isActive ? "font-bold " : ""}
              `
              }
            >
              {item.icon}
              {!isCollapsed && <span className="text-[15px]">{item.text}</span>}
            </NavLink>
          ))}
        </div>

       

        {/* User Profile */}

        {/* Swap log out icons */}
        {/* Click to open log out modal */}
        <div
          onClick={() => setIsLogoutModalOpen(true)}
          className="
          flex items-center gap-3 p-2 
          bg-gray-100 dark:bg-gray-800 rounded-full 
          cursor-pointer transition mt-5
        "
        >
          {/* Log out */}
          <div className="avatar">
            <div className="w-9 rounded-full">
              <img src={user?.photoURL} alt={user?.displayName} />
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col text-sm">
              <span className="font-bold text-[13px]">
                {user?.displayName}
              </span>
              <span className="text-gray-500 text-[11px]">{user?.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Confirm Logout
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to log out of your account?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftSidebar;
