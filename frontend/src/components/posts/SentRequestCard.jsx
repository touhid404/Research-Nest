import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalApplicationApi } from '../../lib/proposalApplicationApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import { Link } from 'react-router';
import { formatTime } from '../../utils/formatTime';


const SentRequestCard = ({ req }) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const queryClient = useQueryClient();


    const cancelMutation = useMutation({
        mutationFn: (id) => proposalApplicationApi.cancelRequest(id),
        onSuccess: () => {
            toast.success("Request canceled successfully");
            queryClient.invalidateQueries({ queryKey: ['sentRequests'] });
            setIsCancelModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to cancel request");
        }
    });


    const statusStyles = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
        accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
        rejected: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30',
        group_formed: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
    };


    const statusLabels = {
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Declined',
        group_formed: 'Team Member',
    };


    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-all duration-500 ${req.status === 'accepted' ? 'bg-emerald-500' : req.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                } group-hover:scale-110`} />


            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-gray-500 block mb-1.5 bg-gray-50 dark:bg-slate-800 w-fit px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-700">
                        Application for
                    </span>
                    <Link
                        to={`/home/posts/post/${req.proposalPostId?._id}`}
                        className="font-bold text-gray-900 dark:text-gray-100 text-[16px] leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors block decoration-blue-500/30 hover:underline underline-offset-4"
                    >
                        {req.proposalPostId?.title || "Unknown Proposal"}
                    </Link>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border transition-all duration-300 shadow-sm ${statusStyles[req.status] || statusStyles.pending}`}>
                        {statusLabels[req.status] || req.status}
                    </span>
                </div>
            </div>


            <div className="mb-4 relative z-10">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all duration-500 bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-transparent group-hover:border-gray-100 dark:group-hover:border-slate-800/50">
                    {req.description}
                </p>
            </div>


            <div className="flex items-center justify-between border-t border-gray-50 dark:border-slate-800/50 pt-3 mt-auto relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 dark:border-slate-700">
                        <img
                            src={req.user?.photoURL || `https://ui-avatars.com/api/?name=${req.user?.name || 'User'}`}
                            alt="Owner"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {req.user?.name || "Unknown"}
                    </span>
                </div>


                <div className="flex items-center gap-4">
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                        {formatTime(req.createdAt)}
                    </span>
                    {req.status === 'pending' && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="h-8 px-5 rounded-full bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 text-xs font-bold transition-all active:scale-95 shadow-sm"
                        >
                            Withdraw
                        </button>
                    )}
                </div>
            </div>


            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={() => cancelMutation.mutate(req._id)}
                title="Cancel Application"
                message="Are you sure you want to withdraw your application for this proposal?"
                confirmText="Yes, Cancel"
                isDanger={true}
                isLoading={cancelMutation.isPending}
            />
        </div>
    );
};


export default SentRequestCard;