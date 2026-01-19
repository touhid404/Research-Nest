
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
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
    IoLogOutOutline,
} from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import ConfirmModal from "../common/ConfirmModal";
import useNotifications from "../../hooks/useNotifications";


const MobileBottomNav = () => {
    const { user, signOutUser } = useAuth();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const { unreadMessagesCount, pendingRequestsCount, totalNotifications } = useNotifications();

    const navItems = [
        { icon: <IoGridOutline size={22} />, activeIcon: <IoGrid size={22} />, path: "/home/posts", label: "Posts" },
        {
            icon: <IoListOutline size={22} />,
            activeIcon: <IoList size={22} />,
            path: "/home/requests",
            label: "Requests",
            badge: pendingRequestsCount > 0 ? pendingRequestsCount : null
        },
        { icon: <IoBookmarkOutline size={22} />, activeIcon: <IoBookmark size={22} />, path: "/home/workspace", label: "Workspace" },
        {
            icon: <IoChatbubbleEllipsesOutline size={22} />,
            activeIcon: <IoChatbubbleEllipses size={22} />,
            path: "/home/messages",
            label: "Messages",
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
        },
        { icon: <IoNewspaperOutline size={22} />, activeIcon: <IoNewspaper size={22} />, path: "/home/paper-hub", label: "Paper Hub" },
        { icon: <IoPersonOutline size={22} />, activeIcon: <IoPerson size={22} />, path: "/home/my-profile", label: "Profile" },
        {
            icon: <IoNotificationsOutline size={22} />,
            activeIcon: <IoNotifications size={22} />,
            path: "/home/notifications",
            label: "Notifications",
        },
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 pb-2 pt-2 px-2  md:hidden">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item, idx) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative ${isActive
                                ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive ? item.activeIcon : item.icon}
                                {item.badge && (
                                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-violet-600 text-white text-[8px] font-bold rounded-full border border-white dark:border-slate-800">
                                        {item.badge}
                                    </span>
                                )}
                            </>
                        )}
                        {/* <span className="text-[10px] mt-1 font-medium">{item.label}</span> */}
                    </NavLink>
                ))}
                {/* Logout button */}
                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    aria-label="Logout"
                >
                    <IoLogOutOutline size={22} />
                    {/* <span className="text-[10px] mt-1 font-medium">Logout</span> */}
                </button>
            </div>
            {/* Logout Confirmation Modal (shared) */}
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                isDanger={true}
            />
        </div>
    );
};

export default MobileBottomNav;
