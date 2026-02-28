/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { NavLink, Link, Outlet, useLocation, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineTune } from "react-icons/md";
import { BiX } from "react-icons/bi";
import PaperRightSidebar from "../../../components/sidebar/PaperRightSidebar";

const PaperHub = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const isCreatePage = location.pathname.includes("share-my-paper");
    const isPaperDetail = location.pathname.includes("/paper/");
    const showSidebar = !isCreatePage && !isPaperDetail;

    // Close mobile filter on route change
    useEffect(() => {
        setIsMobileFilterOpen(false);
    }, [location.pathname]);

    // Active filters count for badge
    const activeFiltersCount = [
        searchParams.get("q"),
        searchParams.get("domains"),
        searchParams.get("yearFrom"),
        searchParams.get("yearTo"),
        searchParams.get("hasPdf"),
        searchParams.get("hasLink"),
        searchParams.get("sort") !== "newest" ? searchParams.get("sort") : null
    ].filter(Boolean).length;

    return (
        <div className="flex h-full relative overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 border-r border-gray-100 dark:border-slate-900 overflow-y-auto custom-scrollbar flex flex-col">
                {/* Header with Tabs + Publish Button */}
                <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 px-4 md:px-6 shadow-sm border-b border-gray-100 dark:border-slate-800/50">
                    <div className="flex flex-row justify-between items-center gap-2 py-2 min-h-[64px]">
                        {/* Tabs */}
                        <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                            <NavLink
                                to="explore-papers"
                                className={({ isActive }) =>
                                    `py-2 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`
                                }
                            >
                                Explore
                            </NavLink>

                            <NavLink
                                to="my-papers"
                                className={({ isActive }) =>
                                    `py-2 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`
                                }
                            >
                                My Papers
                            </NavLink>
                        </div>

                        {/* Action Buttons */}
                        {showSidebar && (
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Mobile Filter Toggle */}
                                <button
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition relative active:scale-95"
                                    title="Filters"
                                >
                                    <MdOutlineTune size={20} />
                                    {activeFiltersCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                <Link
                                    to="share-my-paper"
                                    className="bg-black dark:bg-white text-white dark:text-black text-[12px] md:text-[13px] font-bold px-4 md:px-6 py-2 rounded-full hover:opacity-90 dark:hover:opacity-80 transition-all shadow-md active:scale-95 flex items-center gap-1"
                                >
                                    <span>+</span>
                                    <span className="hidden sm:inline">Share Paper</span>
                                    <span className="sm:hidden text-xs">Share</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>

            {/* Desktop Right Sidebar */}
            {showSidebar && (
                <div className="md:w-[320px] xl:w-[360px] hidden lg:block shrink-0 h-full overflow-hidden">
                    <PaperRightSidebar />
                </div>
            )}

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isMobileFilterOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white dark:bg-slate-900 z-[70] shadow-2xl lg:hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-slate-100">Filters</h3>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    <BiX size={24} className="text-slate-500" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <PaperRightSidebar />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};



export default PaperHub;
