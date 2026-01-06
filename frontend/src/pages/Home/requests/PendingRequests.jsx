import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalApplicationApi } from '../../../lib/proposalApplicationApi';
import toast from 'react-hot-toast';
import RequestCard from '../../../components/posts/RequestCard';
import RequestLoader from '../../../components/loader/RequestLoader';


const PendingRequests = () => {
    const queryClient = useQueryClient();

    // Fetch Pending Requests
    const { data: pendingRequests, isLoading } = useQuery({
        queryKey: ['receivedRequests', 'pending'],
        queryFn: () => proposalApplicationApi.getReceivedRequests('pending'),
    });

    // Mutations
    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => proposalApplicationApi.updateStatus(id, status),
        onSuccess: () => {
            toast.success("Request updated");
            queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
        },
        onError: () => toast.error("Failed to update request"),
    });

    const handleAccept = (id) => statusMutation.mutate({ id, status: 'accepted' });
    const handleReject = (id) => statusMutation.mutate({ id, status: 'rejected' });

    if (isLoading) {
        return <RequestLoader count={5} />;
    }

    return (
        <div className="p-4 space-y-4 mx-auto mt-2">
            {pendingRequests?.length > 0 ? (
                pendingRequests.map((req) => (
                    <RequestCard
                        key={req._id}
                        req={req}
                        isPending={true}
                        onAccept={handleAccept}
                        onReject={handleReject}
                    />
                ))
            ) : (
                <EmptyState tab="pending" />
            )}
        </div>
    );
};


const EmptyState = ({ tab }) => (
    <div className="text-center py-24 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
        <div className="text-gray-300 dark:text-slate-700 mb-4 text-7xl">📭</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            No {tab} requests
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            {tab === 'pending' ? "You're all caught up! No new applications to review." : "You haven't processed any requests yet."}
        </p>
    </div>
);


export default PendingRequests;