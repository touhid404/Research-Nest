import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInfoTooltip } from '../common/PostTooltip';
import useAuth from '../../hooks/useAuth';


const CompactMemberItem = ({ req }) => {
    const { user: currentUser } = useAuth();
    const user = req.sender;
    const isMe = currentUser?.uid === user?.uid;

    return (
        <div className="relative group/member">
            <Link
                to={`/home/profile/${user?.uid}`}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-300"
            >
                <div className="relative shrink-0">
                    <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm transition-transform group-hover/member:scale-110"
                    />
                    {isMe && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white dark:border-slate-900 rounded-full" title="You" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">
                        {user.name}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/70 dark:text-blue-400/70">
                        {req.status === 'group_formed' ? 'Verified' : 'Accepted'}
                    </span>
                </div>
            </Link>
        </div>
    );
};

const ProposalGroupCard = ({ proposalTitle, proposalId, requests, onOpenFormGroup }) => {
    const acceptedRequests = requests.filter(r => r.status === 'accepted');
    const groupFormedRequests = requests.filter(r => r.status === 'group_formed');
    const isGroupFormed = groupFormedRequests.length > 0;
    const displayedRequests = requests.filter(r => ['accepted', 'group_formed'].includes(r.status));


    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            {/* Decoration gradient */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-bl-full -mr-12 -mt-12 pointer-events-none" />


            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 border-b border-gray-100 dark:border-slate-800 pb-4 relative z-10">
                <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 block mb-1.5 bg-gray-50 dark:bg-slate-800 w-fit px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700">
                        Proposal
                    </span>
                    <Link
                        to={`/home/posts/post/${proposalId}`}
                        className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors block decoration-blue-500/30 hover:underline underline-offset-4"
                    >
                        {proposalTitle}
                    </Link>
                    <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                        {displayedRequests.length} Potential Members
                    </p>
                </div>


                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    {isGroupFormed && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/30">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider">Team Active</span>
                        </div>
                    )}


                    {acceptedRequests.length > 0 && (
                        <button
                            onClick={() => onOpenFormGroup(proposalId, proposalTitle)}
                            className="btn btn-sm h-9 min-h-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full border-none shadow-lg shadow-purple-500/20 text-xs font-bold px-5"
                        >
                            ✨ Form Team
                        </button>
                    )}
                </div>
            </div>


            <div className="relative z-10 pt-4 border-t border-gray-50 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                        Team Roster
                    </h3>
                    <div className="h-px flex-1 bg-linear-to-r from-gray-100 to-transparent dark:from-slate-800 mx-4"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {displayedRequests.map(req => (
                        <CompactMemberItem key={req._id} req={req} />
                    ))}
                </div>
            </div>
        </div>
    )
}


export default ProposalGroupCard;