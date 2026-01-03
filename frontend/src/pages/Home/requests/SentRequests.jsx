import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { proposalApplicationApi } from '../../../lib/proposalApplicationApi';
import SentRequestCard from '../../../components/posts/SentRequestCard';


const SentRequests = () => {
    const { data: sentRequests, isLoading } = useQuery({
        queryKey: ['sentRequests'],
        queryFn: () => proposalApplicationApi.getSentRequests(),
    });


    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }


    return (
        <div className="p-4 space-y-4 mx-auto mt-2">
            {sentRequests?.length > 0 ? (
                sentRequests.map((req) => (
                    <SentRequestCard
                        key={req._id}
                        req={req}
                    />
                ))
            ) : (
                <EmptyState />
            )}
        </div>
    );
};


const EmptyState = () => (
    <div className="text-center py-24 bg-gray-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
        <div className="text-gray-300 dark:text-slate-700 mb-4 text-7xl">📤</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            No Sent Requests
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            You haven't applied to any research proposals yet. Start exploring and collaborate!
        </p>
    </div>
);


export default SentRequests;