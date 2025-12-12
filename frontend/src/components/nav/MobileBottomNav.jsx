import React from "react";
import { NavLink } from "react-router";
import {
    FaHome,
    FaListAlt,
    FaBookmark,
    FaEnvelope,
    FaNewspaper,
    FaUser,
    FaBell,
} from "react-icons/fa";

const MobileBottomNav = () => {
    const navItems = [
        { icon: <FaHome size={20} />, text: "Posts", path: "/home/posts" },
        { icon: <FaListAlt size={20} />, text: "Requests", path: "/home/requests" },
        { icon: <FaBookmark size={20} />, text: "Workspace", path: "/home/workspace" },
        { icon: <FaEnvelope size={20} />, text: "Messages", path: "/home/messages" },
        { icon: <FaNewspaper size={20} />, text: "Paper Hub", path: "/home/paper-hub" },
        { icon: <FaUser size={20} />, text: "My Profile", path: "/home/my-profile" },
        { icon: <FaBell size={20} />, text: "Notifications", path: "/home/notifications" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300
              ${isActive
                                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 translate-y-[-4px]"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`
                        }
                    >
                        {item.icon}
                        {/* Optional: Show label on active or remove completely for cleaner look on small screens */}
                        {/* <span className="text-[10px] mt-1 font-medium">{item.text}</span> */}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default MobileBottomNav;
