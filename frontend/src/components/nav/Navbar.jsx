import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaSearch, FaTimes } from "react-icons/fa";
import { useTheme } from "../../provider/ThemeProvider";
import { MoonIcon, SunIcon } from "../../assets/rawIcon/Rawicon";
import ResearchNestLogo from "../logo/ResearchNestLogo";
import DynamicSearch from "./DynamicSearch";
import NotificationDropdown from "./NotificationDropdown";
import useNotifications from "../../hooks/useNotifications";

const Navbar = () => {
    const { theme, setTheme } = useTheme();
    const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const notificationRef = useRef(null);
    const { totalNotifications } = useNotifications();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="
      bg-white dark:bg-slate-950
      border-b border-gray-100 dark:border-slate-900
      sticky top-0 z-1000
    ">
            <div className="flex items-center justify-between lg:mx-3 px-4 py-1 z-100">

                {/* Left: Logo - Hide when mobile search is open */}
                <div className={`flex items-center gap-3 ${isMobileSearchOpen ? 'hidden' : ''}`}>
                    <ResearchNestLogo />
                </div>

                {/* Center: Search (Desktop Only) */}
                <div className="hidden lg:flex flex-1 max-w-[500px] mx-5">
                    <DynamicSearch />
                </div>

                {/* Mobile Search - Full width when open */}
                {isMobileSearchOpen && (
                    <div className="flex-1 flex items-center gap-2 lg:hidden">
                        <div className="flex-1">
                            <DynamicSearch autoFocus />
                        </div>
                        <button
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
                            aria-label="Close search"
                        >
                            <FaTimes size={18} className="text-gray-500" />
                        </button>
                    </div>
                )}

                {/* Right: Icons - Hide when mobile search is open */}
                <div className={`flex items-center gap-2 ${isMobileSearchOpen ? 'hidden' : ''}`}>

                    {/* Search Icon (Mobile Only) */}
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="lg:hidden p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Search"
                    >
                        <FaSearch size={18} className="text-gray-700 dark:text-gray-300" />
                    </button>

                    {/* Notifications */}
                    <div className="relative hidden md:block" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={`cursor-pointer p-2.5 relative hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors ${isNotificationOpen ? "bg-gray-200 dark:bg-gray-700" : ""
                                }`}
                            aria-label="Notifications"
                        >
                            <FaBell size={18} className="text-gray-700 dark:text-gray-300" />
                            {totalNotifications > 0 && (
                                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-primary text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-950">
                                    {totalNotifications}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {isNotificationOpen && <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />}
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="cursor-pointer p-2 rounded-full text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                        {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Navbar;
