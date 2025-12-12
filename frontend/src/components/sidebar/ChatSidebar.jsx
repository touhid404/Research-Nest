import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaCircle, FaSearch, FaTrash } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useChatStore from "../../store/useChatStore";

const ChatSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    conversations,
    users = [],
    selectedConversation,
    isLoading,
    fetchConversations,
    fetchUsers,
    getOrCreateConversation,
    setSelectedConversation, // Still might be useful for immediate feedback, but URL source of truth is better
    onlineUsers,
    deleteConversation,
  } = useChatStore();

  // Fetch conversations and users on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUsers();
    }
  }, [user]);

  // Filter out current user
  const availableUsers = users.filter(
    (u) => u.uid !== user?.uid && u._id !== user?.uid
  );

  // Get users who don't have conversations yet
  const usersWithoutConversations = availableUsers.filter((u) => {
    return !conversations.some((conv) =>
      conv.otherUser?.uid === u.uid || conv.otherUser?._id === u._id
    );
  });

  // Filter based on search
  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.otherUser;
    return (
      otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredUsersWithoutConv = usersWithoutConversations.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString();
  };

  const handleUserClick = (selectedUser) => {
    // Navigate to the user's chat URL
    navigate(`/home/messages/${selectedUser.uid || selectedUser._id}`);
    setSearchTerm("");
  };

  const handleConversationClick = (conversation) => {
    const otherUser = conversation.otherUser;
    // Navigate to the user's chat URL
    navigate(`/home/messages/${otherUser.uid || otherUser._id}`);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Messages</h2>

        {/* Search Bar */}
        <div className="relative group">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {isLoading && conversations.length === 0 ? (
          <div className="p-2 flex flex-col items-center justify-center space-y-3 mt-10 opacity-50">
            <span className="loading loading-spinner loading-lg text-violet-500"></span>
            <p className="text-sm">Loading chats...</p>
          </div>
        ) : (
          <>
            {/* Existing Conversations */}
            {filteredConversations.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">Recent Chats</h3>
                {filteredConversations.map((conversation) => {
                  const otherUser = conversation.otherUser;
                  const isSelected = selectedConversation?._id === conversation._id;
                  const isOnline = onlineUsers.includes(otherUser?.uid);

                  return (
                    <div
                      key={conversation._id}
                      onClick={() => handleConversationClick(conversation)}
                      className={`
                        group relative flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-300
                        ${isSelected
                          ? "bg-white dark:bg-slate-800 shadow-sm ring-1 ring-violet-500/20"
                          : "hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm"
                        }
                      `}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-violet-500 rounded-r-full"></div>
                      )}

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className={`avatar placeholder transition-transform ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}>
                          <div className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-900 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-slate-700 dark:to-slate-800">
                            {otherUser?.photoURL ? (
                              <img src={otherUser.photoURL} alt={otherUser.name} />
                            ) : (
                              <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                                {otherUser?.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Status Dot */}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className={`font-semibold truncate ${isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-slate-200'}`}>
                            {otherUser?.name}
                          </span>
                          {conversation.lastMessage && (
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                              {formatTime(conversation.updatedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-sm truncate max-w-[140px] ${conversation.unreadCount > 0 ? 'font-semibold text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>
                            {conversation.lastMessage?.text || "No messages yet"}
                          </p>
                          <div className="flex items-center gap-2">
                            {conversation.unreadCount > 0 && (
                              <span className="flex items-center justify-center p-1 min-w-[20px] h-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[10px] font-bold text-white shadow-sm">
                                {conversation.unreadCount}
                              </span>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Delete this conversation?")) {
                                  deleteConversation(conversation._id);
                                }
                              }}
                              className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete conversation"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Users Without Conversations */}
            {filteredUsersWithoutConv.length > 0 && (
              <div className="space-y-1 mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">Suggested People</h3>
                {filteredUsersWithoutConv.map((availableUser) => {
                  return (
                    <div
                      key={availableUser._id || availableUser.uid}
                      onClick={() => handleUserClick(availableUser)}
                      className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm group"
                    >
                      <div className="avatar placeholder group-hover:scale-105 transition-transform">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800">
                          {availableUser?.photoURL ? (
                            <img src={availableUser.photoURL} alt={availableUser.name} />
                          ) : (
                            <span className="text-slate-500 font-bold">{availableUser?.name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="font-semibold block text-slate-700 dark:text-slate-300 truncate">
                          {availableUser?.name}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          Start a new conversation
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-violet-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {filteredConversations.length === 0 && filteredUsersWithoutConv.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                <FaSearch className="text-4xl mb-3 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500">No users found</p>
                {searchTerm && <p className="text-sm text-slate-400">Try a different search term</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
