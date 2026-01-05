import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalApplicationApi } from '../../lib/proposalApplicationApi';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';


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
        pending: 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30',
        accepted: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30',
        rejected: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30',
        group_formed: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
    };


    const statusLabels = {
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Declined',
        group_formed: 'Team Member',
    };


    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-4 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-colors duration-500 ${req.status === 'accepted' ? 'bg-green-500' : req.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />


            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 block mb-1">
                        Application for
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-tight">
                        {req.proposalPostId?.title || "Unknown Proposal"}
                    </h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border transition-colors duration-300 ${statusStyles[req.status] || statusStyles.pending}`}>
                        {statusLabels[req.status] || req.status}
                    </span>
                </div>
            </div>


            <div className="mb-4 relative z-10">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
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
                        {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    {req.status === 'pending' && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="btn btn-sm h-8 min-h-0 px-5 rounded-full bg-white dark:bg-transparent border border-gray-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 dark:hover:border-red-900/30 text-xs font-semibold"
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