import { NavLink, Link, Outlet, useLocation, useSearchParams } from 'react-router';
import { BiPlus, BiSearch } from "react-icons/bi";


const PaperHub = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const isCreatePage = location.pathname.includes("share-my-paper");
    const searchQuery = searchParams.get("q") || "";


    const handleSearch = (e) => {
        const value = e.target.value;
        if (value) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };


    return (
        <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 border-r border-gray-100 dark:border-slate-900 overflow-y-auto custom-scrollbar">




                {/* Header with Tabs */}
                <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 pb-0">
                        <div className="flex gap-8">
                            <NavLink
                                to="explore-papers"
                                className={({ isActive }) =>
                                    `pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${isActive
                                        ? "border-black dark:border-white text-black dark:text-white"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`
                                }
                            >
                                Explore Papers
                            </NavLink>




                            <NavLink
                                to="my-papers"
                                className={({ isActive }) =>
                                    `pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${isActive
                                        ? "border-black dark:border-white text-black dark:text-white"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`
                                }
                            >
                                My Papers
                            </NavLink>
                        </div>




                        {/* Right Actions: Search + Publish */}
                        <div className="flex items-center gap-3 pb-2 md:pb-0">
                            {!isCreatePage && (
                                <>
                                    <div className="relative group">
                                        <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search papers, authors..."
                                            value={searchQuery}
                                            onChange={handleSearch}
                                            className="pl-9 pr-4 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none w-full md:w-64 transition-all"
                                        />
                                    </div>
                                    <Link
                                        to="share-my-paper"
                                        className="bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-4 py-2 rounded-full hover:opacity-80 transition shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <BiPlus size={18} />
                                        <span className="hidden sm:inline">Publish Paper</span>
                                        <span className="sm:hidden">New</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>




                {/* Content Area */}
                <Outlet />




            </div>








        </div>
    );
};




export default PaperHub;









