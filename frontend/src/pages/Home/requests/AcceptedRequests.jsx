import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { proposalApplicationApi } from '../../../lib/proposalApplicationApi';
import FormGroupModal from '../../../components/posts/FormGroupModal';
import ProposalGroupCard from '../../../components/posts/ProposalGroupCard';


const AcceptedRequests = () => {
    const [isFormGroupModalOpen, setIsFormGroupModalOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState({ id: null, title: '' });


    // Fetch Completed Requests
    const { data: completedRequests, isLoading } = useQuery({
        queryKey: ['receivedRequests', 'completed'],
        queryFn: () => proposalApplicationApi.getReceivedRequests('completed'),
    });


    // Group completed requests by proposalPostId
    const groupedCompletedRequests = useMemo(() => {
        if (!completedRequests) return {};


        // Only show accepted or already in group
        const filtered = completedRequests.filter(req =>
            req.status === 'accepted' || req.status === 'group_formed'
        );


        return filtered.reduce((acc, req) => {
            const postId = req.proposalPostId?._id || "unknown";
            const postTitle = req.proposalPostId?.title || "Unknown Post";


            if (!acc[postId]) {
                acc[postId] = {
                    title: postTitle,
                    requests: []
                };
            }
            acc[postId].requests.push(req);
            return acc;
        }, {});
    }, [completedRequests]);


    const handleOpenFormGroup = (proposalId, proposalTitle) => {
        setSelectedProposal({ id: proposalId, title: proposalTitle });
        setIsFormGroupModalOpen(true);
    }


    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }


    return (
        <div className="p-4 space-y-4 mx-auto mt-2">
            {Object.keys(groupedCompletedRequests).length > 0 ? (
                Object.entries(groupedCompletedRequests).map(([postId, group]) => (
                    <ProposalGroupCard
                        key={postId}
                        proposalId={postId}
                        proposalTitle={group.title}
                        requests={group.requests}
                        onOpenFormGroup={handleOpenFormGroup}
                    />
                ))
            ) : (
                <EmptyState tab="completed" />
            )}


            <FormGroupModal
                isOpen={isFormGroupModalOpen}
                onClose={() => setIsFormGroupModalOpen(false)}
                proposalPostId={selectedProposal.id}
                defaultName={selectedProposal.title + " Team"}
            />
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


export default AcceptedRequests;