import React from 'react';
import { BiPlus } from "react-icons/bi";


import { NavLink, Link, Outlet, useLocation } from 'react-router';


const PaperHub = () => {
    const location = useLocation();
    const isCreatePage = location.pathname.includes("share-my-paper");


    return (
        <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 border-r border-gray-100 dark:border-slate-900 overflow-y-auto custom-scrollbar">


                {/* Header with Tabs */}
                <div className="sticky top-0 bg-transparent backdrop-blur-md z-10 px-4">
                    <div className="flex items-end justify-between">
                        <div className="flex gap-8">
                            <NavLink
                                to="explore-papers"
                                className={({ isActive }) =>
                                    `pb-3 pt-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${isActive
                                        ? "border-black dark:border-white text-black dark:text-white"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`
                                }
                            >
                                Explore Papers
                                {({ isActive }) => (isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white rounded-full" />
                                ))}
                            </NavLink>


                            <NavLink
                                to="my-papers"
                                className={({ isActive }) =>
                                    `pb-3 pt-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${isActive
                                        ? "border-black dark:border-white text-black dark:text-white"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`
                                }
                            >
                                My Papers
                            </NavLink>
                        </div>


                        {!isCreatePage && (
                            <Link
                                to="share-my-paper"
                                className="bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2 rounded-full hover:opacity-80 transition shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <BiPlus size={18} />
                                Publish Paper
                            </Link>
                        )}
                    </div>
                </div>


                {/* Content Area */}
                <Outlet />


            </div>




        </div>
    );
};


export default PaperHub;



