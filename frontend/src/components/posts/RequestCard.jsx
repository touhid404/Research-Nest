import React from 'react';
import { Link } from 'react-router';


const RequestCard = ({ req, isPending, onAccept, onReject }) => {
    return (
        <div
            className={`flex flex-col sm:flex-row items-start gap-4 p-5 mb-4
            rounded-2xl ${isPending ? 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5' : 'bg-gray-50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800'}
            transition-all duration-300 relative overflow-hidden group`}
        >
            {/* Gradient for pending cards */}
            {isPending && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
            )}


            {/* Avatar Section */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                    <img
                        src={req.sender.photoURL || "https://ui-avatars.com/api/?name=" + req.sender.name}
                        alt={req.sender.name}
                        className="w-full h-full object-cover"
                    />
                </div>


            {/* Info Section */}
            <div className="flex-1 w-full min-w-0 z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">
                            {req.sender.name}
                        </h3>
                        {!isPending && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border
                                ${req.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : ''}
                                ${req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' : ''}
                                ${req.status === 'group_formed' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' : ''}
                            `}>
                                {req.status === 'group_formed' ? 'Team Member' : req.status}
                            </span>
                        )}
                    </div>
                    {isPending && (
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                    )}
                </div>


                {isPending && (
                    <div className="mb-3 px-3 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-800 mx-[-0.5rem] sm:mx-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Applied for: <span className="font-semibold text-gray-700 dark:text-gray-300">"{req.proposalPostId?.title}"</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {req.description}
                        </p>
                    </div>
                )}


                {!isPending && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-1">
                        {req.description}
                    </p>
                )}


                {/* Actions Section */}
                {isPending && (
                    <div className="flex items-center gap-3 mt-3">
                        <button
                            onClick={() => onAccept(req._id)}
                            className="btn btn-sm h-8 min-h-0 px-5 rounded-full bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white border-none text-xs font-semibold shadow-lg shadow-black/5"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => onReject(req._id)}
                            className="btn btn-sm h-8 min-h-0 px-5 rounded-full bg-white dark:bg-transparent border border-gray-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 dark:hover:border-red-900/30 text-xs font-semibold"
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