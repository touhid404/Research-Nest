import { create } from 'zustand';
import { chatApi } from '../lib/chatApi';

const useChatStore = create((set, get) => ({
    // State
    conversations: [],
    selectedConversation: null,
    messages: [],
    users: [],
    isLoading: false,
    error: null,

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

    // Mark messages as read
    markAsRead: async (conversationId) => {
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
        } catch (error) {
            console.error('Error marking as read:', error);
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
        try {
            await chatApi.deleteConversation(conversationId);

            // Remove from state
            const { conversations, selectedConversation } = get();
            const updatedConversations = conversations.filter(c => c._id !== conversationId);
            set({ conversations: updatedConversations });

            // If selected, clear it
            if (selectedConversation && selectedConversation._id === conversationId) {
                set({ selectedConversation: null, messages: [] });
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
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

                // Immediately mark as read if we are viewing this conversation
                // You might need a way to ensure this is clean, but for now:
                // We typically call markAsRead separately, but we could trigger it here.
                // Note: Calling actions inside listeners is fine.
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

            // If conversation not found, we should probably fetch conversations to get the new one
            // Detailed implementation might be needed if new conversation logic is strict

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
                // If specific messageIds provided, strictly match. If not, maybe mark all?
                // Backend implementation suggests just re-emitting payload. 
                // Usually we mark all messages in that conversation as read, or specific ones.
                // Assuming messageIds is passed (or we interpret the event as "messages in this conv read")
                if (messageIds && messageIds.includes(msg._id)) {
                    return { ...msg, isRead: true };
                }
                // Fallback: if user read the conversation, likely the last message is read
                // But safer to rely on IDs if available. 
                // If messageIds is undefined (e.g. read all), then:
                if (!messageIds && msg.conversationId === conversationId) {
                    return { ...msg, isRead: true };
                }
                return msg;
            });

            set({ messages: updatedMessages });

            // Should we update conversation lastMessage status? 
            // Maybe complex to track deeply nested object, but typically 'lastMessage' is a summary.
        });
    },

    unsubscribeFromSocket: () => {
        const { socket } = get();
        if (!socket) return;

        socket.off("getOnlineUsers");
        socket.off("user:online");
        socket.off("user:offline");
        socket.off("message:new");
        socket.off("conversation:update");
        socket.off("typing:start");
        socket.off("typing:stop");
        socket.off("message:read");
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
