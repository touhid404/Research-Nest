import React from "react";
import { FaFlask, FaBell, FaSearch } from "react-icons/fa";
import { useTheme } from "../../provider/ThemeProvider";
import { MoonIcon, SunIcon } from "../../assets/rawIcon/Rawicon";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="sticky top-0 z-50 
      bg-white dark:bg-gray-900
      backdrop-blur-lg border-b 
      border-gray-100 dark:border-gray-800
    ">
      <div className="flex items-center justify-between px-4 py-2 max-w-[1300px] mx-auto">
        
        {/* Left Section */}
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <FaFlask size={24} className="text-gray-900 dark:text-gray-100" />
            <span className="hidden sm:block font-bold text-lg text-gray-900 dark:text-gray-100">
              Research Nest
            </span>
          </div>
        </div>

        {/* Search (Desktop Only) */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none 
              text-gray-500 dark:text-gray-400 
              group-focus-within:text-primary transition-colors">
              <FaSearch size={16} />
            </div>

            <input
              type="text"
              placeholder="Search Research Nest"
              className="w-full rounded-full pl-11 py-2
              bg-gray-100 dark:bg-gray-800
              text-gray-900 dark:text-gray-100 
              placeholder-gray-500 dark:placeholder-gray-400
              focus:bg-white dark:focus:bg-gray-700
              focus:ring-2 focus:ring-primary/30
              border border-gray-300 dark:border-gray-700
              transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-gray-900 dark:text-gray-100
            hover:bg-gray-200 dark:hover:bg-gray-700
            transition-colors duration-300"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Navbar;
