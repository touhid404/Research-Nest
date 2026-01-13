import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../../utils/formatTime';
import { UserInfoTooltip } from '../common/PostTooltip';
import useAuth from '../../hooks/useAuth';


const RequestCard = ({ req, isPending, onAccept, onReject }) => {
    const { user: currentUser } = useAuth();
    const user = req.sender;
    const isOwner = currentUser?.uid === user?.uid;

    const ProfileWrapper = ({ children, className }) => {
        if (isOwner) return <div className={className}>{children}</div>;
        return (
            <Link
                to={`/home/profile/${user?.uid}`}
                className={`${className} group/profile`}
            >
                {children}
            </Link>
        );
    };

    return (
        <div
            className={`flex flex-row items-start gap-3 sm:gap-4 p-4 sm:p-5 mb-4
            rounded-2xl ${isPending ? 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5' : 'bg-gray-50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800'}
            transition-all duration-300 relative overflow-hidden group`}
        >
            {/* Gradient for pending cards */}
            {isPending && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
            )}


            {/* Avatar Section */}
            <div className="relative shrink-0">
                <ProfileWrapper className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm block">
                    <img
                        src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.name}
                        alt={user.name}
                        className="w-full h-full object-cover transition-transform group-hover/profile:scale-110"
                    />
                </ProfileWrapper>
            </div>


            {/* Info Section */}
            <div className="flex-1 min-w-0 z-10">
                <div className="flex flex-row items-center justify-between gap-1 mb-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex flex-col">
                            <ProfileWrapper className="block">
                                <h3 className={`font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-tight transition-colors ${!isOwner ? "group-hover/profile:text-blue-600 dark:group-hover/profile:text-blue-400" : ""}`}>
                                    {user.name}
                                </h3>
                            </ProfileWrapper>
                            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                                {formatTime(req.createdAt)}
                            </span>
                        </div>
                        {!isPending && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border
                                ${req.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30' : ''}
                                ${req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30' : ''}
                                ${req.status === 'group_formed' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' : ''}
                            `}>
                                {req.status === 'group_formed' ? 'Team Member' : req.status}
                            </span>
                        )}
                    </div>
                </div>


                {isPending && (
                    <div className="mb-4">
                        <div className="mb-3 px-3.5 py-2.5 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block mb-1">
                                Applied for
                            </span>
                            <Link
                                to={`/home/posts/post/${req.proposalPostId?._id}`}
                                className="text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block mb-2 leading-tight decoration-blue-500/30 hover:underline underline-offset-4"
                            >
                                "{req.proposalPostId?.title}"
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic border-l-2 border-blue-200 dark:border-blue-800 pl-3">
                                {req.description}
                            </p>
                        </div>
                    </div>
                )}


                {!isPending && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3 bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-xl">
                        {req.description}
                    </p>
                )}


                {/* Actions Section */}
                {isPending && (
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={() => onAccept(req._id)}
                            className="h-9 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => onReject(req._id)}
                            className="h-9 px-6 rounded-full bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-xs font-bold transition-all active:scale-95"
                        >
                            Decline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


export default RequestCard;