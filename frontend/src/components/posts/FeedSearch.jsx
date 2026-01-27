import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes, FaArrowRight, FaUserAlt, FaHistory } from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { proposalApi } from "../../lib/proposalApi";
import { userApi } from "../../lib/userApi";

const FeedSearch = () => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState([]);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("recentProposalSearches");
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Fetch Proposals
    const { data: postsData } = useQuery({
        queryKey: ["allProposalPostsSearch"],
        queryFn: () => proposalApi.getAllProposalPosts(),
        enabled: isOpen || isFocused,
    });

    // Fetch Users
    const { data: usersData } = useQuery({
        queryKey: ["allUsersSearch"],
        queryFn: () => userApi.getAllUsers(),
        enabled: isOpen || isFocused,
    });

    // Enhanced Filter Logic
    const filteredPosts = (postsData?.data || [])
        .filter(post =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.user?.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);

    const filteredUsers = (usersData?.data || [])
        .filter(user => user.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3);

    const allResults = query.trim() === ""
        ? recentSearches.map(s => ({ type: 'recent', query: s }))
        : [
            ...filteredUsers.map(user => ({ ...user, type: 'user' })),
            ...filteredPosts.map(post => ({ ...post, type: 'post' }))
        ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addToRecent = (searchQuery) => {
        if (!searchQuery.trim()) return;
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentProposalSearches", JSON.stringify(updated));
    };

    const handleSelect = (result) => {
        if (result.type === 'post') {
            navigate(`/home/posts/post/${result._id}`);
            addToRecent(result.title);
        } else if (result.type === 'user') {
            navigate(`/home/profile/${result.uid}`);
            addToRecent(result.name);
        } else if (result.type === 'recent') {
            setQuery(result.query);
            return;
        }
        setQuery("");
        setIsOpen(false);
        setIsFocused(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && selectedIndex < allResults.length) {
                handleSelect(allResults[selectedIndex]);
            } else if (query.trim()) {
                addToRecent(query);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setIsFocused(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className="relative flex justify-end" ref={containerRef}>
            <motion.div
                initial={false}
                animate={{ width: isFocused || query ? 400 : 130 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative flex items-center h-[38px] min-w-[130px]"
            >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FaSearch size={12} />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={isFocused || query ? "Search posts, topics, or people..." : "Search"}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setIsFocused(true);
                    }}
                    onKeyDown={handleKeyDown}
                    className="
                        w-full h-full rounded-full pl-10 pr-8 
                        bg-gray-50 dark:bg-slate-900/50
                        text-gray-900 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:bg-white dark:focus:bg-slate-900
                        focus:ring-2 focus:ring-primary/20
                        border border-gray-100 dark:border-slate-800/50
                        transition-colors duration-200 text-[13px] font-bold
                    "
                />
                <AnimatePresence>
                    {(query || (isFocused && recentSearches.length > 0)) && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => {
                                setQuery("");
                                if (query === "") setIsOpen(false);
                                inputRef.current?.focus();
                            }}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <FaTimes size={10} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (query.trim() !== "" || recentSearches.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="
                            absolute top-full left-0 right-0 mt-2 
                            bg-white dark:bg-slate-900 
                            border border-gray-100 dark:border-slate-800 
                            rounded-2xl shadow-2xl overflow-hidden z-[100]
                        "
                    >
                        <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {query.trim() === "" ? (
                                // Recent Searches
                                <div>
                                    <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Searches</p>
                                    {recentSearches.map((s, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelect({ type: 'recent', query: s })}
                                            className={`
                                                w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                                                ${selectedIndex === index ? "bg-primary text-white" : "hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300"}
                                            `}
                                        >
                                            <FaHistory size={10} className="text-gray-400" />
                                            <span className="text-xs font-medium truncate flex-1 text-left">{s}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : allResults.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Researchers Section */}
                                    {filteredUsers.length > 0 && (
                                        <div>
                                            <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Researchers</p>
                                            {filteredUsers.map((user, index) => {
                                                const globalIndex = index;
                                                return (
                                                    <button
                                                        key={user.uid}
                                                        onClick={() => handleSelect({ ...user, type: 'user' })}
                                                        className={`
                                                            w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                                                            ${selectedIndex === globalIndex ? "bg-primary text-white" : "hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300"}
                                                        `}
                                                    >
                                                        <div className="shrink-0">
                                                            {user.photoURL ? (
                                                                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100 dark:ring-slate-700" />
                                                            ) : (
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedIndex === globalIndex ? "bg-white/20" : "bg-gray-100 dark:bg-slate-800"}`}>
                                                                    <FaUserAlt size={12} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                                            <span className="text-xs font-bold truncate">{user.name}</span>
                                                            <span className={`text-[10px] truncate ${selectedIndex === globalIndex ? "text-white/70" : "text-gray-500"}`}>{user.occupation || 'Researcher'}</span>
                                                        </div>
                                                        <FaArrowRight size={8} className={selectedIndex === globalIndex ? "opacity-100" : "opacity-0"} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Proposals Section */}
                                    {filteredPosts.length > 0 && (
                                        <div>
                                            <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Proposals</p>
                                            {filteredPosts.map((post, index) => {
                                                const globalIndex = filteredUsers.length + index;
                                                return (
                                                    <button
                                                        key={post._id}
                                                        onClick={() => handleSelect({ ...post, type: 'post' })}
                                                        className={`
                                                            w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                                                            ${selectedIndex === globalIndex ? "bg-primary text-white" : "hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-gray-300"}
                                                        `}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedIndex === globalIndex ? "bg-white/20" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"}`}>
                                                            <IoNewspaperOutline size={14} />
                                                        </div>
                                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                                            <span className="text-xs font-bold truncate text-left w-full">{post.title}</span>
                                                            <span className={`text-[10px] truncate ${selectedIndex === globalIndex ? "text-white/70" : "text-gray-500"}`}>by {post.user?.name}</span>
                                                        </div>
                                                        <FaArrowRight size={8} className={selectedIndex === globalIndex ? "opacity-100" : "opacity-0"} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-400 text-xs italic">
                                    No proposals or researchers found for "{query}"
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeedSearch;
