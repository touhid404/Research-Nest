import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useChatStore from "../store/useChatStore";
import useAuth from "./useAuth";
import { proposalApplicationApi } from "../lib/proposalApplicationApi";
import { notificationsApi } from "../lib/notificationsApi";

const useNotifications = () => {
    const { user } = useAuth();
    const { conversations, fetchConversations } = useChatStore();
    const queryClient = useQueryClient();

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

    // --- General Notifications ---
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationsApi.getAll,
        enabled: !!user,
        refetchInterval: 15000,
    });

    const unreadGeneralCount = notifications.filter(n => !n.isRead).length;

    // Mutations
    const markAsReadMutation = useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    return {
        unreadMessagesCount,
        pendingRequestsCount,
        notifications,
        unreadGeneralCount,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        totalNotifications: unreadMessagesCount + pendingRequestsCount + unreadGeneralCount
    };
};

export default useNotifications;
