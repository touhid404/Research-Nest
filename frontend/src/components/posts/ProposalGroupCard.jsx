import React from 'react';
import RequestCard from './RequestCard';
import { Link } from 'react-router';


const ProposalGroupCard = ({ proposalTitle, proposalId, requests, onOpenFormGroup }) => {
    // Filter to find if any are accepted but not yet in a group (to verify if we can form a group)
    // Or if they are already group_formed.
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


            <div className="space-y-4 relative z-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                    Team Members
                </h3>
                {displayedRequests.map(req => (
                    <RequestCard key={req._id} req={req} isPending={false} />
                ))}
            </div>
        </div>
    )
}


export default ProposalGroupCard;