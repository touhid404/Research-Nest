import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaArrowRight, FaTimes } from "react-icons/fa";
import {
    IoGridOutline,
    IoListOutline,
    IoBookmarkOutline,
    IoChatbubbleEllipsesOutline,
    IoNewspaperOutline,
    IoPersonOutline,
    IoNotificationsOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router";

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
    { path: "/home/workspace", label: "Workspace Calendar & Events", category: "Workspace", icon: <IoBookmarkOutline /> },
    { path: "/home/workspace", label: "Meeting Room & Video Calls", category: "Workspace", icon: <IoBookmarkOutline /> },
    { path: "/home/workspace", label: "Shared Documents & Files", category: "Workspace", icon: <IoBookmarkOutline /> },

    // Communication & System
    { path: "/home/messages", label: "Messages & Chat", category: "Communication", icon: <IoChatbubbleEllipsesOutline /> },
    { path: "/home/notifications", label: "My Notifications", category: "System", icon: <IoNotificationsOutline /> },

    // Profile
    { path: "/home/my-profile/overview", label: "My Profile Overview", category: "Profile", icon: <IoPersonOutline /> },
    { path: "/home/my-profile/posts", label: "My Profile Posts", category: "Profile", icon: <IoPersonOutline /> },
];

const DynamicSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const inputRef = useRef(null);

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

    // Filter routes based on query
    useEffect(() => {
        if (query.trim() === "") {
            setResults([]);
            return;
        }

        const filtered = APP_ROUTES.filter(route =>
            route.label.toLowerCase().includes(query.toLowerCase()) ||
            route.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);

        setResults(filtered);
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

    const handleSelect = (path) => {
        navigate(path);
        setQuery("");
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                handleSelect(results[selectedIndex].path);
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
                    text-gray-400 group-focus-within:text-primary transition-colors">
                    <FaSearch size={14} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search Anything..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="
                        w-full rounded-full pl-11 pr-16 py-2
                        bg-gray-100 dark:bg-gray-800/80
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-500 dark:placeholder-gray-400
                        focus:bg-white dark:focus:bg-gray-950
                        focus:ring-2 focus:ring-primary/20
                        border border-gray-200 dark:border-gray-800
                        transition-all duration-200 text-sm
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
                        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-400 whitespace-nowrap">
                            <span className="text-[9px]">CTRL</span>
                            <span>K</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop for clarity when open */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[999998]" onClick={() => setIsOpen(false)} />
            )}

            {/* Results Dropdown Container */}
            {isOpen && (query || results.length > 0) && (
                <div className="
                    absolute top-full left-0 right-0 mt-2 
                    bg-white dark:bg-slate-900 
                    border border-gray-200 dark:border-slate-800 
                    rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                    overflow-hidden z-[999999] transform origin-top transition-all duration-200
                    animate-in fade-in slide-in-from-top-2
                    backdrop-blur-xl bg-opacity-98 dark:bg-opacity-98
                ">
                    <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {results.length > 0 ? (
                            <div className="space-y-0.5">
                                <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
                                {results.map((result, index) => (
                                    <button
                                        key={result.path}
                                        onClick={() => handleSelect(result.path)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                                            ${selectedIndex === index
                                                ? "bg-primary text-white"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}
                                        `}
                                    >
                                        <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                            ${selectedIndex === index ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}
                                        `}>
                                            {result.icon}
                                        </div>
                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                            <span className={`font-medium text-[14px] truncate ${selectedIndex === index ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
                                                {result.label}
                                            </span>
                                            <span className={`text-[11px] uppercase tracking-wider font-semibold ${selectedIndex === index ? "text-white/70" : "text-gray-500"}`}>
                                                {result.category}
                                            </span>
                                        </div>
                                        <FaArrowRight size={10} className={`transition-transform duration-200 ${selectedIndex === index ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} />
                                    </button>
                                ))}
                            </div>
                        ) : query && (
                            <div className="px-4 py-12 text-center">
                                <div className="bg-gray-50 dark:bg-gray-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaSearch size={16} className="text-gray-400" />
                                </div>
                                <p className="text-gray-900 dark:text-gray-100 font-semibold text-sm">No results found</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Try searching for something else</p>
                            </div>
                        )}
                    </div>
                    {results.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800/40 px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex gap-3">
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 leading-none">Enter</kbd> to select
                                </span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 leading-none">↑↓</kbd> to move
                                </span>
                            </div>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 leading-none">ESC</kbd> to close
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DynamicSearch;
