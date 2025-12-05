import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { useTheme } from "../../provider/ThemeProvider";
import { MoonIcon, SunIcon } from "../../assets/rawIcon/Rawicon";
import ResearchNestLogo from "../logo/ResearchNestLogo";
import { Link } from "react-router";

const RootNav = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div
      className="
        sticky top-0 z-50 
        bg-white/30 dark:bg-gray-900/30
        backdrop-blur-sm 
        border-b border-white/20 dark:border-gray-800/20
      "
    >
      <div className="flex items-center justify-between px-4 py-2 max-w-[1300px] mx-auto">

        {/* Left Section - Logo */}
          <ResearchNestLogo />

        {/* Center Navigation Links */}
        <div className="hidden text-black dark:text-white lg:flex items-center gap-8">
          <Link className="nav-link" to="/home/posts">Dashboard</Link>
          <a className="nav-link" href="#">Tutorials</a>
          <a className="nav-link" href="#">Research Tools</a>
          <a className="nav-link" href="#">Community</a>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">

          {/* Mobile Search */}
          <button
            className="lg:hidden p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
            aria-label="Search"
          >
            <FaSearch size={18} className="text-gray-700 dark:text-gray-300" />
          </button>

        

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="
              p-2 rounded-xl 
              text-gray-900 dark:text-gray-100
              hover:bg-gray-200 dark:hover:bg-gray-700
              transition
            "
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Get Started Button */}
          <button
            className="
              hidden sm:block
              bg-primary text-white font-medium
              px-4 py-2 rounded-lg
              hover:bg-primary/90
              transition-all duration-300
              shadow-sm
            "
          >
            Get Started
          </button>

        </div>
      </div>
    </div>
  );
};

export default RootNav;
