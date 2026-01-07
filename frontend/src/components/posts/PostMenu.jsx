import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { BiDotsVerticalRounded, BiShareAlt, BiTrash, BiEditAlt, BiCheckCircle } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const PostMenu = ({
    isOwner,
    onEdit,
    onDelete,
    onToggleStatus,
    onCopyLink,
    status
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const updateCoords = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position relative to the center-left of the button
            setCoords({
                top: rect.top + rect.height / 2 + window.scrollY,
                left: rect.right + window.scrollX
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    const menuContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: coords.top,
                            left: coords.left,
                            transform: 'translate(-100%, -50%)', // Align right-center of menu to the anchor point
                            zIndex: 9999,
                            pointerEvents: 'none'
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: 10 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            style={{ pointerEvents: 'auto' }}
                            className="w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-1.5 overflow-hidden"
                        >
                            <div className="px-3 py-1 mb-1 border-b border-gray-100 dark:border-slate-800">
                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] px-1">
                                    Post Actions
                                </span>
                            </div>

                            {isOwner ? (
                                <>
                                    <button
                                        onClick={() => {
                                            onEdit();
                                            setIsOpen(false);
                                        }}
                                        className="w-[calc(100%-12px)] mx-1.5 px-2.5 py-1.5 text-left text-[13px] font-semibold flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-200 group"
                                    >
                                        <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <BiEditAlt size={14} />
                                        </div>
                                        Edit Post
                                    </button>
                                    <button
                                        onClick={() => {
                                            onToggleStatus();
                                            setIsOpen(false);
                                        }}
                                        className="w-[calc(100%-12px)] mx-1.5 px-2.5 py-1.5 text-left text-[13px] font-semibold flex items-center gap-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-200 group"
                                    >
                                        <div className="p-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <BiCheckCircle size={14} />
                                        </div>
                                        {status === "hidden" ? "Mark as Published" : "Mark as Hidden"}
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-3" />
                                    <button
                                        onClick={() => {
                                            onDelete();
                                            setIsOpen(false);
                                        }}
                                        className="w-[calc(100%-12px)] mx-1.5 px-2.5 py-1.5 text-left text-[13px] font-semibold flex items-center gap-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl transition-all duration-200 group"
                                    >
                                        <div className="p-1 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <BiTrash size={14} />
                                        </div>
                                        Delete Post
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        onCopyLink();
                                        setIsOpen(false);
                                    }}
                                    className="w-[calc(100%-12px)] mx-1.5 px-2.5 py-1.5 text-left text-[13px] font-semibold flex items-center gap-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-200 group"
                                >
                                    <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <BiShareAlt size={14} />
                                    </div>
                                    Copy Link
                                </button>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all active:scale-95"
            >
                <BiDotsVerticalRounded size={22} />
            </button>

            {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
        </div>
    );
};

export default PostMenu;
