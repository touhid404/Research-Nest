import { useState, useEffect } from "react";
import { useTheme } from "../../provider/ThemeProvider";
import { MoonIcon, SunIcon } from "../../assets/rawIcon/Rawicon";
import ResearchNestLogo from "../logo/ResearchNestLogo";
import { Link } from "react-router";
import useAuth from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const RootNav = () => {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for sticky effect styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Reviews", href: "#reviews" },
    { name: "About", href: "#about" },
  ];

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`
        fixed top-0 left-0 right-0 z-50 flex justify-center
        transition-all duration-300
        ${scrolled ? "md:pt-4" : "pt-2"}
      `}
    >
      <div
        className={`
          flex items-center justify-between px-6 py-2
          md:w-[60%] w-full max-w-7xl
          md:rounded-2xl
          transition-all duration-300
          ${scrolled
            ? "backdrop-blur-md bg-white/80 dark:bg-slate-900/80 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
            : "bg-transparent border-transparent"
          }
        `}
      >
        {/* Logo */}
        <ResearchNestLogo />

        {/* Centered Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {/* Auth Button */}
          {user ? (
            <Link
              to="/home/posts"
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="px-5 py-2 rounded-xl bg-violet-600 text-white font-bold text-sm shadow-md hover:bg-violet-700 hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RootNav;