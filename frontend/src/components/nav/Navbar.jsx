import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { useTheme } from "../../provider/ThemeProvider";
import { MoonIcon, SunIcon } from "../../assets/rawIcon/Rawicon";
import ResearchNestLogo from "../logo/ResearchNestLogo";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className="
      bg-white dark:bg-slate-950
      border-b border-gray-100 dark:border-slate-900
      sticky top-0 z-50
    ">
      <div className="flex items-center justify-between lg:mx-3 px-4 py-2">

        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <ResearchNestLogo />
        </div>

        {/* Center: Search (Desktop Only) */}
        <div className="hidden lg:flex flex-1 max-w-[600px] mx-5">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none
              text-gray-500 dark:text-gray-400 group-focus-within:text-primary transition-colors">
              <FaSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="Search Research Nest"
              className="
                w-full rounded-full pl-11 py-2
                bg-gray-100 dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:bg-white dark:focus:bg-gray-700
                focus:ring-2 focus:ring-primary/30
                border border-gray-300 dark:border-gray-700
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-2">

          {/* Search Icon (Mobile Only) */}
          <button
            className="lg:hidden p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Search"
          >
            <FaSearch size={18} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* Notifications */}
          <button
            className="p-2.5 relative hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <FaBell size={18} className="text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-gray-950"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Navbar;
