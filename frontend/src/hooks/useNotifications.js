import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useChatStore from "../store/useChatStore";
import useAuth from "./useAuth";
import { proposalApplicationApi } from "../lib/proposalApplicationApi";

const useNotifications = () => {
    const { user } = useAuth();
    const { conversations, fetchConversations } = useChatStore();

    // Fetch conversations on mount if not already fetching
    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    // Calculate total unread messages
    const unreadMessagesCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    // Fetch Pending Requests count
    const { data: pendingRequests } = useQuery({
        queryKey: ['receivedRequests', 'pending'],
        queryFn: () => proposalApplicationApi.getReceivedRequests('pending'),
        enabled: !!user,
        refetchInterval: 30000, // Optional: poll every 30s as backup to real-time if needed
    });

    const pendingRequestsCount = pendingRequests?.length || 0;

    return {
        unreadMessagesCount,
        pendingRequestsCount,
        totalNotifications: unreadMessagesCount + pendingRequestsCount
    };
};

export default useNotifications;
