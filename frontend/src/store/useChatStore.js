import { create } from 'zustand';
import { chatApi } from '../lib/chatApi';
import toast from 'react-hot-toast';

const initialChatState = {
    // State
    conversations: [],
    selectedConversation: null,
    messages: [],
    users: [],
    isLoading: false,
    error: null,
};

const useChatStore = create((set, get) => ({
    ...initialChatState,

    // Reset store to initial state (call on logout)
    resetStore: () => set(initialChatState),

    // Actions
    setConversations: (conversations) => set({ conversations }),

    setSelectedConversation: (conversation) => set({
        selectedConversation: conversation,
        messages: [] // Clear messages when switching conversations
    }),

    setMessages: (messages) => set({ messages }),

    setUsers: (users) => set({ users }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    // Fetch all conversations
    fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await chatApi.getConversations();
            set({ conversations: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Fetch all users
    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            const response = await chatApi.getAllUsers();
            set({ users: Array.isArray(response.data) ? response.data : [], isLoading: false });
        } catch (error) {
            console.error('Error fetching users:', error);
            set({ error: error.message, isLoading: false, users: [] });
        }
    },

    // Get or create conversation
    getOrCreateConversation: async (otherUserId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await chatApi.getOrCreateConversation(otherUserId);
            const newConversation = response.data;

            // Update conversations list
            const { conversations } = get();
            const existingIndex = conversations.findIndex(c => c._id === newConversation._id);

            if (existingIndex >= 0) {
                conversations[existingIndex] = newConversation;
            } else {
                conversations.unshift(newConversation);
            }

            set({
                conversations: [...conversations],
                selectedConversation: newConversation,
                isLoading: false
            });

            // Fetch messages for this conversation
            get().fetchMessages(newConversation._id);

            return newConversation;

        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Create group conversation
    createGroupConversation: async (participantIds, groupName, createWorkspace = false) => {
        set({ isLoading: true, error: null });
        try {
            const response = await chatApi.createGroupConversation({ participantIds, groupName, createWorkspace });
            const newConversation = response.data;

            // Update conversations list (prepend)
            const { conversations } = get();
            set({
                conversations: [newConversation, ...conversations],
                selectedConversation: newConversation,
                isLoading: false
            });

            return newConversation;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Leave group
    leaveGroup: async (conversationId) => {
        const { conversations, selectedConversation } = get();
        // Optimistic update
        const previousConversations = [...conversations];
        const previousSelected = selectedConversation;

        const updatedConversations = conversations.filter(c => c._id !== conversationId);
        set({ conversations: updatedConversations });

        if (selectedConversation?._id === conversationId) {
            set({ selectedConversation: null, messages: [] });
        }

        try {
            await chatApi.leaveGroup(conversationId);
        } catch (error) {
            console.error("Error leaving group:", error);
            // Revert on error
            set({
                conversations: previousConversations,
                selectedConversation: previousSelected
            });
            throw error;
        }
    },

    // Remove member (kick)
    removeMember: async (conversationId, memberId) => {
        try {
            await chatApi.removeMember(conversationId, memberId);
            // We might need to update the conversation participants locally if we want immediate UI update
            // However, fetching conversations again or updating the specific one is better
            const { conversations, selectedConversation } = get();

            const updateParticipants = (conv) => {
                if (conv._id === conversationId && conv.participants) {
                    return {
                        ...conv,
                        participants: conv.participants.filter(p => (p.uid || p._id || p) !== memberId)
                    };
                }
                return conv;
            };

            const updatedConversations = conversations.map(updateParticipants);
            set({ conversations: updatedConversations });

            if (selectedConversation?._id === conversationId) {
                set({ selectedConversation: updateParticipants(selectedConversation) });
            }

        } catch (error) {
            console.error("Error removing member:", error);
            throw error;
        }
    },

    // Fetch messages for a conversation
    fetchMessages: async (conversationId) => {
        if (!conversationId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await chatApi.getMessages(conversationId);
            set({ messages: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    // Send a message
    sendMessage: async (conversationId, text, attachment = null) => {
        try {
            const response = await chatApi.sendMessage({
                conversationId,
                text,
                attachment,
            });

            const newMessage = response.data;

            // Add message to current messages
            const { messages, conversations } = get();
            set({ messages: [...messages, newMessage] });

            // Update last message in conversations
            const updatedConversations = conversations.map(conv => {
                if (conv._id === conversationId) {
                    return {
                        ...conv,
                        lastMessage: newMessage,
                        updatedAt: new Date(),
                    };
                }
                return conv;
            });

            set({ conversations: updatedConversations });

            return newMessage;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },



    // Delete a message
    deleteMessage: async (messageId) => {
        try {
            await chatApi.deleteMessage(messageId);

            // Remove from state
            const { messages } = get();
            set({ messages: messages.filter(m => m._id !== messageId) });

            // Note: If last message was deleted, we should ideally fetch conversations again 
            // to update the sidebar preview, or we can handle it via socket/local update.
            // For simplicity, let's fetch conversations to ensure sync.
            get().fetchConversations();
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    // Delete a conversation
    deleteConversation: async (conversationId) => {
        const { conversations, selectedConversation } = get();
        // Optimistic update
        const previousConversations = [...conversations];
        const previousSelected = selectedConversation;

        // Immediately remove from list
        const updatedConversations = conversations.filter(c => c._id !== conversationId);
        set({ conversations: updatedConversations });

        // Immediately clear selected conversation if it matches
        // Check both _id and id to be robust
        const selectedId = selectedConversation?._id || selectedConversation?.id;
        if (selectedConversation && (String(selectedId) === String(conversationId))) {
            set({ selectedConversation: null, messages: [] });
        }

        try {
            await chatApi.deleteConversation(conversationId);
        } catch (error) {
            console.error('Error deleting conversation:', error);
            // Revert state on error (restore list and selection)
            set({
                conversations: previousConversations,
                selectedConversation: previousSelected
            });
            toast.error("Failed to delete conversation");
            throw error;
        }
    },

    // Socket related state
    socket: null,
    typingUsers: {},
    onlineUsers: [], // Array of user IDs or Set

    // Socket Actions
    subscribeToSocket: (socket) => {
        const { conversations } = get();
        set({ socket });

        if (!socket) return;

        // Listen for connection events to refresh data (e.g. after offline)
        socket.on("connect", () => {
            get().fetchConversations();
        });

        // Listen for online users list
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        socket.on("user:online", ({ userId }) => {
            set((state) => ({
                onlineUsers: [...state.onlineUsers, userId]
            }));
        });

        socket.on("user:offline", ({ userId }) => {
            set((state) => ({
                onlineUsers: state.onlineUsers.filter(id => id !== userId)
            }));
        });

        // Listen for new messages
        socket.on("message:new", (message) => {
            const { messages, selectedConversation, conversations } = get();

            // Only add if it's for the current conversation
            if (selectedConversation && message.conversationId === selectedConversation._id) {
                // Deduplicate: Check if message already exists
                const messageExists = messages.some(m => m._id === message._id);
                if (!messageExists) {
                    set({ messages: [...messages, message] });
                }
            }

            // Update conversations list (update last message, unread count, move to top)
            const updatedConversations = conversations.map(conv => {
                const isSelected = selectedConversation && selectedConversation._id === message.conversationId;
                if (conv._id === message.conversationId) {
                    return {
                        ...conv,
                        lastMessage: message,
                        updatedAt: new Date(),
                        unreadCount: isSelected ? 0 : (conv.unreadCount || 0) + 1,
                    };
                }
                return conv;
            });

            // Sort by updatedAt
            updatedConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            set({ conversations: updatedConversations });
        });

        // Listen for conversation updates
        socket.on("conversation:update", ({ conversationId, lastMessage, updatedAt }) => {
            const { conversations, fetchConversations } = get();

            // Update conversation in the list
            const updatedConversations = conversations.map(conv => {
                if (conv._id === conversationId) {
                    return {
                        ...conv,
                        lastMessage,
                        updatedAt,
                        // Increment unread count for the receiver receiving the update
                        unreadCount: (conv.unreadCount || 0) + 1,
                    };
                }
                return conv;
            });

            // Sort by updatedAt
            updatedConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            set({ conversations: updatedConversations });

            // If conversation doesn't exist (new conversation started by someone else), fetch all conversations
            if (!conversations.find(c => c._id === conversationId)) {
                fetchConversations();
            }
        });

        // Listen for group/conversation deletion
        socket.on("conversation:deleted", ({ conversationId }) => {
            const { conversations, selectedConversation } = get();
            const updatedConversations = conversations.filter(c => c._id !== conversationId);
            set({ conversations: updatedConversations });

            const selectedId = selectedConversation?._id || selectedConversation?.id;
            if (selectedConversation && (String(selectedId) === String(conversationId))) {
                set({ selectedConversation: null, messages: [] });
                toast.error("Conversation deleted");
            }
        });

        // Listen for message deletion
        socket.on("message:deleted", ({ messageId, conversationId }) => {
            const { messages, selectedConversation, conversations } = get();

            // Remove from messages if currently viewing that conversation
            if (selectedConversation && selectedConversation._id === conversationId) {
                set({ messages: messages.filter(m => m._id !== messageId) });
            }

            // Update lastMessage in conversations list if needed (optional implementation)
            // Ideally we'd fetch the conversation again or have the payload include the new last message
            // For now, let's just trigger a conversation refresh if it was the last message to keep it synced
            const conversation = conversations.find(c => c._id === conversationId);
            if (conversation && conversation.lastMessage && conversation.lastMessage._id === messageId) {
                // Fetch updated conversation or just conversations list to get new last message
                get().fetchConversations();
            }
        });

        // Listen for being kicked from a group
        socket.on("conversation:kicked", ({ conversationId }) => {
            const { conversations, selectedConversation } = get();
            const updatedConversations = conversations.filter(c => c._id !== conversationId);
            set({ conversations: updatedConversations });

            if (selectedConversation?._id === conversationId) {
                set({ selectedConversation: null, messages: [] });
                toast.error("You have been removed from the group");
            } else {
                toast.error("You have been removed from a group");
            }
        });

        // Listen for group updates (members left/removed)
        socket.on("group:update", ({ conversationId, participants, groupAdmin }) => {
            const { conversations, selectedConversation } = get();
            const updatedConversations = conversations.map(conv => {
                if (conv._id === conversationId) {
                    return {
                        ...conv,
                        participants,
                        groupAdmin
                    };
                }
                return conv;
            });

            set({ conversations: updatedConversations });

            // Update selected conversation if it's the one modified
            if (selectedConversation && selectedConversation._id === conversationId) {
                set({
                    selectedConversation: {
                        ...selectedConversation,
                        participants,
                        groupAdmin
                    }
                });
            }
        });

        // Listen for typing events
        socket.on("typing:start", ({ userId, conversationId }) => {
            set((state) => ({
                typingUsers: { ...state.typingUsers, [userId]: true }
            }));

            // Auto-stop typing after 3 seconds (failsafe)
            setTimeout(() => {
                set((state) => {
                    const newTyping = { ...state.typingUsers };
                    delete newTyping[userId];
                    return { typingUsers: newTyping };
                });
            }, 3000);
        });

        socket.on("typing:stop", ({ userId }) => {
            set((state) => {
                const newTyping = { ...state.typingUsers };
                delete newTyping[userId];
                return { typingUsers: newTyping };
            });
        });

        // Listen for read receipts
        socket.on("message:read", ({ conversationId, messageIds }) => {
            const { messages, conversations } = get();

            // Update messages in current view
            const updatedMessages = messages.map(msg => {
                if (messageIds && messageIds.includes(msg._id)) {
                    return { ...msg, isRead: true };
                }
                if (!messageIds && msg.conversationId === conversationId) {
                    return { ...msg, isRead: true };
                }
                return msg;
            });

            set({ messages: updatedMessages });
        });
    },

    unsubscribeFromSocket: () => {
        const { socket } = get();
        if (!socket) return;

        socket.off("getOnlineUsers");
        socket.off("user:online");
        socket.off("user:offline");
        socket.off("message:new");
        socket.off("message:deleted");
        socket.off("conversation:update");
        socket.off("typing:start");
        socket.off("typing:stop");
        socket.off("message:read");
        socket.off("conversation:deleted");
        socket.off("conversation:kicked");
        set({ socket: null });
    },

    // Socket Emitters
    joinConversation: (conversationId) => {
        const { socket } = get();
        if (socket && conversationId) {
            socket.emit("conversation:join", conversationId);
        }
    },

    leaveConversation: (conversationId) => {
        const { socket } = get();
        if (socket && conversationId) {
            socket.emit("conversation:leave", conversationId);
        }
    },

    emitTyping: (conversationId) => {
        const { socket } = get();
        if (socket && conversationId) {
            socket.emit("typing:start", conversationId);
        }
    },

    emitStopTyping: (conversationId) => {
        const { socket } = get();
        if (socket && conversationId) {
            socket.emit("typing:stop", conversationId);
        }
    },

    // Send message via socket (for optimistic UI / realtime delivery)
    sendSocketMessage: (conversationId, message) => {
        const { socket } = get();
        if (socket) {
            socket.emit("message:send", {
                conversationId,
                message,
            });
        }
    },

    // Mark messages as read
    markAsRead: async (conversationId) => {
        const { socket, messages } = get();
        try {
            await chatApi.markAsRead(conversationId);

            // Update unread count in conversations
            const { conversations } = get();
            const updatedConversations = conversations.map(conv => {
                if (conv._id === conversationId) {
                    return { ...conv, unreadCount: 0 };
                }
                return conv;
            });

            set({ conversations: updatedConversations });

            // Emit socket event to notify sender
            if (socket) {
                // We might want to send the IDs of unread messages, but usually just saying "I read this conv" is enough
                // if the backend handles it. But our backend expects `messageIds` or we can adapt it.
                // Let's send the conversationId.
                socket.emit("message:read", { conversationId, messageIds: null });
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    },

    // Clear selected conversation
    clearSelectedConversation: () => set({
        selectedConversation: null,
        messages: []
    }),
}));

export default useChatStore;
