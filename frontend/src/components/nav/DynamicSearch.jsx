import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch, FaArrowRight, FaTimes } from "react-icons/fa";
import {
    IoGridOutline,
    IoListOutline,
    IoBookmarkOutline,
    IoChatbubbleEllipsesOutline,
    IoNewspaperOutline,
    IoPersonOutline,
    IoNotificationsOutline,
    IoDocumentTextOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router";
import { searchApi } from "../../lib/searchApi";

const APP_ROUTES = [
    // Feed
    { path: "/home/posts/explore", label: "Explore Proposals & Posts", category: "Feed", icon: <IoGridOutline /> },
    { path: "/home/posts/myposts", label: "My Proposal Posts", category: "Feed", icon: <IoGridOutline /> },
    { path: "/home/posts/create-post", label: "Create New Proposal", category: "Feed", icon: <IoGridOutline /> },

    // Requests
    { path: "/home/requests/pending", label: "Incoming / Pending Requests", category: "Requests", icon: <IoListOutline /> },
    { path: "/home/requests/accepted", label: "Accepted Connections", category: "Requests", icon: <IoListOutline /> },
    { path: "/home/requests/sent", label: "Sent Request History", category: "Requests", icon: <IoListOutline /> },

    // Paper Hub
    { path: "/home/paper-hub/explore-papers", label: "Explore Research Papers", category: "Paper Hub", icon: <IoNewspaperOutline /> },
    { path: "/home/paper-hub/my-papers", label: "My Published Papers", category: "Paper Hub", icon: <IoNewspaperOutline /> },
    { path: "/home/paper-hub/share-my-paper", label: "Publish / Share Paper", category: "Paper Hub", icon: <IoNewspaperOutline /> },

    // Workspace
    { path: "/home/workspace", label: "Workspace Overview & Collaboration", category: "Workspace", icon: <IoBookmarkOutline /> },
    // { path: "/home/workspace", label: "Workspace Calendar & Events", category: "Workspace", icon: <IoBookmarkOutline /> },
    // { path: "/home/workspace", label: "Meeting Room & Video Calls", category: "Workspace", icon: <IoBookmarkOutline /> },
    // { path: "/home/workspace", label: "Shared Documents & Files", category: "Workspace", icon: <IoBookmarkOutline /> },

    // Communication & System
    { path: "/home/messages", label: "Messages & Chat", category: "Communication", icon: <IoChatbubbleEllipsesOutline /> },
    { path: "/home/notifications", label: "My Notifications", category: "System", icon: <IoNotificationsOutline /> },

    // Profile
    { path: "/home/my-profile/overview", label: "My Profile Overview", category: "Profile", icon: <IoPersonOutline /> },
    { path: "/home/my-profile/posts", label: "My Profile Posts", category: "Profile", icon: <IoPersonOutline /> },
];

const DynamicSearch = ({ autoFocus = false }) => {
    const [query, setQuery] = useState("");

    // Results state
    const [navResults, setNavResults] = useState([]);
    const [dbResults, setDbResults] = useState({ posts: [], users: [], papers: [] });
    const [loading, setLoading] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const navigate = useNavigate();
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Auto focus on mount if prop is true
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
            setIsOpen(true);
        }
    }, [autoFocus]);
    const resultRefs = useRef([]);

    // Debounce timer ref
    const debounceTimeout = useRef(null);

    // Keyboard shortcut handler (Ctrl + K)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Filter routes & fetch DB results
    useEffect(() => {
        if (query.trim() === "") {
            setNavResults([]);
            setDbResults({ posts: [], users: [], papers: [] });
            setLoading(false);
            return;
        }

        // 1. Local Navigation Filter
        const filteredNav = APP_ROUTES.filter(route =>
            route.label.toLowerCase().includes(query.toLowerCase()) ||
            route.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        setNavResults(filteredNav);

        // 2. Remote DB Search (Debounced)
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        setLoading(true);
        debounceTimeout.current = setTimeout(async () => {
            try {
                const data = await searchApi.globalSearch(query);
                if (data.success) {
                    setDbResults(data.data);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimeout.current);
    }, [query]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item, type) => {
        setQuery("");
        setIsOpen(false);

        if (type === 'nav') {
            navigate(item.path);
        } else if (type === 'post') {
            navigate(`/home/posts/post/${item._id}`);
        } else if (type === 'user') {
            navigate(`/home/profile/${item.uid}`);
        } else if (type === 'paper') {
            navigate(`/home/paper-hub/paper/${item._id}`);
        }
    };

    // Flatten results for keyboard navigation - Memoized for performance
    const flatResults = useMemo(() => {
        const combined = [];

        // Navigation
        navResults.forEach(r => combined.push({ ...r, type: 'nav' }));

        // Posts
        dbResults.posts.forEach(r => combined.push({ ...r, type: 'post' }));

        // Users
        dbResults.users.forEach(r => combined.push({ ...r, type: 'user' }));

        // Papers
        dbResults.papers.forEach(r => combined.push({ ...r, type: 'paper' }));

        return combined;
    }, [navResults, dbResults]);

    // Cleanup refs on re-render
    useEffect(() => {
        resultRefs.current = resultRefs.current.slice(0, flatResults.length);
    }, [flatResults]);

    // Scroll into view when selected index changes
    useEffect(() => {
        if (selectedIndex !== -1 && resultRefs.current[selectedIndex]) {
            resultRefs.current[selectedIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex]);


    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            e.preventDefault(); // Prevent cursor moving in input
            setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault(); // Prevent cursor moving in input
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < flatResults.length) {
                const item = flatResults[selectedIndex];
                handleSelect(item, item.type);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className="relative w-full group" ref={containerRef}>
            {/* Search Input In Navbar */}
            <div className={`relative flex items-center transition-all duration-300 ${isOpen ? "z-[999999]" : "z-[100000]"}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none
                    text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                    <FaSearch size={14} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search posts, people, papers..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="
                        w-full rounded-2xl pl-11 pr-16 py-2.5
                        bg-gray-100/50 dark:bg-gray-900/50
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-500 dark:placeholder-gray-400
                        focus:bg-white dark:focus:bg-gray-950
                        focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30
                        border border-transparent focus:border-indigo-500/30
                        transition-all duration-200 text-[14px] font-medium shadow-sm hover:shadow-md focus:shadow-lg
                    "
                />

                {/* Shortcut Hint */}
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    {query ? (
                        <button
                            onClick={() => {
                                setQuery("");
                                inputRef.current?.focus();
                            }}
                            className="pointer-events-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <FaTimes size={12} />
                        </button>
                    ) : (
                        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[10px] font-bold text-gray-400 whitespace-nowrap shadow-sm">
                            <span className="text-[9px]">CTRL</span>
                            <span>K</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop for clarity when open */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[999998]" onClick={() => setIsOpen(false)} />
            )}

            {/* Results Dropdown Container */}
            {isOpen && (query || flatResults.length > 0) && (
                <div className="
                    absolute top-full left-0 right-0 mt-3
                    bg-white dark:bg-slate-900
                    border border-gray-100 dark:border-slate-800
                    rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.4)]
                    overflow-hidden z-[999999] transform origin-top transition-all duration-200
                    animate-in fade-in slide-in-from-top-2
                ">
                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {flatResults.length > 0 ? (
                            <div className="py-2">
                                {/* Navigation Results */}
                                {navResults.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 border-b border-gray-50 dark:border-gray-800/50">Navigation</p>
                                        <div className="px-2 pt-1">
                                            {navResults.map((result, index) => {
                                                const globalIndex = index;
                                                return (
                                                    <button
                                                        key={`nav-${index}`}
                                                        ref={el => resultRefs.current[globalIndex] = el}
                                                        onClick={() => handleSelect(result, 'nav')}
                                                        className={`
                                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                                                    ${selectedIndex === globalIndex
                                                                ? "bg-indigo-50 dark:bg-indigo-900/10 shadow-sm"
                                                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                                                `}
                                                    >
                                                        <div className={`
                                                    w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                                    ${selectedIndex === globalIndex ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}
                                                `}>
                                                            {result.icon}
                                                        </div>
                                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                                            <span className={`font-medium text-sm truncate ${selectedIndex === globalIndex ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-gray-100"}`}>
                                                                {result.label}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500">{result.category}</span>
                                                        </div>
                                                        {selectedIndex === globalIndex && <FaArrowRight size={12} className="text-indigo-500 mr-1 animate-in slide-in-from-left-2 fade-in duration-300" />}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Proposal Posts Results */}
                                {dbResults.posts.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 border-b border-gray-50 dark:border-gray-800/50">Proposals</p>
                                        <div className="px-2 pt-1">
                                            {dbResults.posts.map((post, index) => {
                                                const globalIndex = navResults.length + index;
                                                return (
                                                    <button
                                                        key={`post-${post._id}`}
                                                        ref={el => resultRefs.current[globalIndex] = el}
                                                        onClick={() => handleSelect(post, 'post')}
                                                        className={`
                                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                                                    ${selectedIndex === globalIndex
                                                                ? "bg-blue-50 dark:bg-blue-900/10 shadow-sm"
                                                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                                                `}
                                                    >
                                                        <div className={`
                                                    w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                                    ${selectedIndex === globalIndex ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"}
                                                `}>
                                                            <IoDocumentTextOutline />
                                                        </div>
                                                        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                                                            <span className={`font-medium text-sm truncate w-full ${selectedIndex === globalIndex ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"}`}>
                                                                {post.title}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 truncate w-full">{post.researchTopic}</span>
                                                        </div>
                                                        {selectedIndex === globalIndex && <FaArrowRight size={12} className="text-blue-500 mr-1 animate-in slide-in-from-left-2 fade-in duration-300" />}

                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Users Results */}
                                {dbResults.users.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 border-b border-gray-50 dark:border-gray-800/50">Researchers</p>
                                        <div className="px-2 pt-1">
                                            {dbResults.users.map((user, index) => {
                                                const globalIndex = navResults.length + dbResults.posts.length + index;
                                                return (
                                                    <button
                                                        key={`user-${user.uid}`}
                                                        ref={el => resultRefs.current[globalIndex] = el}
                                                        onClick={() => handleSelect(user, 'user')}
                                                        className={`
                                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                                                    ${selectedIndex === globalIndex
                                                                ? "bg-emerald-50 dark:bg-emerald-900/10 shadow-sm"
                                                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                                                `}
                                                    >
                                                        <img
                                                            src={user.photoURL}
                                                            alt={user.name}
                                                            className={`
                                                        w-9 h-9 rounded-full object-cover shrink-0 ring-2 transition-all
                                                        ${selectedIndex === globalIndex ? "ring-emerald-200 dark:ring-emerald-800" : "ring-transparent"}
                                                    `}
                                                        />
                                                        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                                                            <span className={`font-medium text-sm truncate w-full ${selectedIndex === globalIndex ? "text-emerald-900 dark:text-emerald-100" : "text-gray-900 dark:text-gray-100"}`}>
                                                                {user.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 truncate w-full">{user.occupation || "Researcher"}</span>
                                                        </div>
                                                        {selectedIndex === globalIndex && <FaArrowRight size={12} className="text-emerald-500 mr-1 animate-in slide-in-from-left-2 fade-in duration-300" />}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Papers Results */}
                                {dbResults.papers.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10 border-b border-gray-50 dark:border-gray-800/50">Papers</p>
                                        <div className="px-2 pt-1">
                                            {dbResults.papers.map((paper, index) => {
                                                const globalIndex = navResults.length + dbResults.posts.length + dbResults.users.length + index;
                                                return (
                                                    <button
                                                        key={`paper-${paper._id}`}
                                                        ref={el => resultRefs.current[globalIndex] = el}
                                                        onClick={() => handleSelect(paper, 'paper')}
                                                        className={`
                                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group
                                                    ${selectedIndex === globalIndex
                                                                ? "bg-purple-50 dark:bg-purple-900/10 shadow-sm"
                                                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                                                `}
                                                    >
                                                        <div className={`
                                                    w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                                    ${selectedIndex === globalIndex ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-purple-50 dark:bg-purple-900/20 text-purple-500"}
                                                `}>
                                                            <IoNewspaperOutline />
                                                        </div>
                                                        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                                                            <span className={`font-medium text-sm truncate w-full ${selectedIndex === globalIndex ? "text-purple-900 dark:text-purple-100" : "text-gray-900 dark:text-gray-100"}`}>
                                                                {paper.title}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 truncate w-full">{paper.researchDomain}</span>
                                                        </div>
                                                        {selectedIndex === globalIndex && <FaArrowRight size={12} className="text-purple-500 mr-1 animate-in slide-in-from-left-2 fade-in duration-300" />}

                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : query ? (
                            <div className="px-4 py-12 text-center">
                                {loading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-gray-900 dark:text-gray-100 text-sm font-medium">Searching...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center opacity-60">
                                        <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                                            <FaSearch size={20} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">No results found</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Try searching for something else</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Footer */}
                    {flatResults.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900/40 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-500 font-medium">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm font-sans">Enter</kbd> to select
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm font-sans">↑↓</kbd> to move
                                </span>
                            </div>
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm font-sans">ESC</kbd> to close
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DynamicSearch;
