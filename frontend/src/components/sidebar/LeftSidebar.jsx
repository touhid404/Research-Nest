import { NavLink, useNavigate } from "react-router";
import { useState, useEffect } from "react";

import {
  IoGridOutline,
  IoGrid,
  IoListOutline,
  IoList,
  IoBookmarkOutline,
  IoBookmark,
  IoChatbubbleEllipsesOutline,
  IoChatbubbleEllipses,
  IoNewspaperOutline,
  IoNewspaper,
  IoPersonOutline,
  IoPerson,
  IoNotificationsOutline,
  IoNotifications,
  IoMenuOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import ConfirmModal from "../common/ConfirmModal";
import useNotifications from "../../hooks/useNotifications";

const LeftSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { unreadMessagesCount, pendingRequestsCount, totalNotifications } = useNotifications();

  const navItems = [
    {
      icon: <IoGridOutline size={22} />,
      activeIcon: <IoGrid size={22} />,
      text: "Posts",
      path: "/home/posts",
    }, // Home
    {
      icon: <IoListOutline size={22} />,
      activeIcon: <IoList size={22} />,
      text: "Requests",
      path: "/home/requests",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    }, // Requests / Tasks
    {
      icon: <IoBookmarkOutline size={22} />,
      activeIcon: <IoBookmark size={22} />,
      text: "Workspace",
      path: "/home/workspace",
    }, // Workspace / Saved
    {
      icon: <IoChatbubbleEllipsesOutline size={22} />,
      activeIcon: <IoChatbubbleEllipses size={22} />,
      text: "Messages",
      path: "/home/messages",
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
    }, // Messages / Inbox
    {
      icon: <IoNewspaperOutline size={22} />,
      activeIcon: <IoNewspaper size={22} />,
      text: "Paper Hub",
      path: "/home/paper-hub",
    }, // News / Papers
    {
      icon: <IoPersonOutline size={22} />,
      activeIcon: <IoPerson size={22} />,
      text: "My Profile",
      path: "/home/my-profile",
    }, // Profile
    {
      icon: <IoNotificationsOutline size={22} />,
      activeIcon: <IoNotifications size={22} />,
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
            flex items-center gap-3 py-2 px-3 rounded-xl
            hover:bg-gray-100 dark:hover:bg-gray-700 
            mb-2
          "
          >
            <IoMenuOutline size={26} className="text-gray-600 dark:text-gray-300" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="text-[15px] font-medium whitespace-nowrap overflow-hidden"
                >
                  Menu
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* REAL NAV ITEMS */}
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `
              flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-300
              text-gray-600 dark:text-gray-300 relative
  
              ${isActive ? "font-bold bg-gray-100 dark:bg-slate-900/50" : ""}
              `
              }
            >
              {/* Render active or inactive icon based on state */}
              {({ isActive }) => (
                <>
                  {isActive ? item.activeIcon : item.icon}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex items-center justify-between flex-1 overflow-hidden"
                      >
                        <span className="text-[15px] whitespace-nowrap">
                          {item.text}
                        </span>
                        {item.badge && (
                          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-[10px] font-bold text-white ml-2">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bubble Badge for Collapsed State */}
                  {isCollapsed && item.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="
                        absolute -top-1 -right-1 
                        flex items-center justify-center
                        min-w-[18px] h-[18px] px-0.5
                        bg-gradient-to-br from-violet-600 to-fuchsia-600 
                        text-[9px] font-bold text-white 
                        rounded-full border-2 border-white dark:border-slate-950 
                        shadow-sm
                      "
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>



        {/* User Profile */}

        {/* Swap log out icons */}
        {/* Click to open log out modal */}
        <div
          onClick={() => setIsLogoutModalOpen(true)}
          className="
          group relative
          flex items-center gap-3 p-2 
          bg-gray-50 dark:bg-slate-900/50 rounded-xl 
          cursor-pointer transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/10 mt-5
          overflow-hidden
        "
        >
          {/* Default Content (Visible when NOT hovered) */}
          <div className="flex items-center gap-3 w-full transition-opacity duration-300 group-hover:opacity-0">
            <div className="avatar">
              <div className="w-10 rounded-full ring-2 ring-gray-100 dark:ring-slate-800">
                <img src={user?.photoURL} alt={user?.displayName} />
              </div>
            </div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="font-semibold text-[14px] truncate text-gray-800 dark:text-gray-200">
                    {user?.displayName}
                  </span>
                  <span className="text-gray-500 text-[11px] truncate">{user?.email}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hover Overlay (Visible when hovered) */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500 dark:text-red-400 font-medium whitespace-nowrap">
            <IoLogOutOutline size={24} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        isDanger={true}
      />
    </>
  );
};

export default LeftSidebar;
