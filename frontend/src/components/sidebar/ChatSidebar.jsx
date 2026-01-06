import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaSearch } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import useChatStore from "../../store/useChatStore";
import SidebarHeader from "../chat/SidebarHeader";
import SidebarConversationItem from "../chat/SidebarConversationItem";
import SidebarUserItem from "../chat/SidebarUserItem";
import SidebarModals from "../chat/SidebarModals";
import ChatSidebarLoader from "../loader/ChatSidebarLoader";

const ChatSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'leave' | 'delete' | 'kick', payload: conversation }
  const [infoModalConversation, setInfoModalConversation] = useState(null);

  const {
    conversations,
    users = [],
    selectedConversation,
    isLoading,
    fetchConversations,
    fetchUsers,
    onlineUsers,
    deleteConversation,
    leaveGroup
  } = useChatStore();

  // Fetch conversations and users on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUsers();
    }
  }, [user]);

  // Effect to handle being removed from a group
  useEffect(() => {
    if (!user || !conversations.length) return;

    if (selectedConversation && selectedConversation.isGroup) {
      const isParticipant = selectedConversation.participants?.some(
        p => p.uid === user.uid || p._id === user.uid || p === user.uid
      );

      if (selectedConversation.participants && !isParticipant) {
        useChatStore.getState().setSelectedConversation(null);
        navigate("/home/messages");
        const updatedConvs = conversations.filter(c => {
          if (c._id === selectedConversation._id) return false;
          return true;
        });
        useChatStore.getState().setConversations(updatedConvs);
      }
    }
  }, [conversations, selectedConversation, user, navigate]);

  // Filter out current user
  const availableUsers = users.filter(
    (u) => u.uid !== user?.uid && u._id !== user?.uid
  );

  // Get users who don't have conversations yet
  const usersWithoutConversations = availableUsers.filter((u) => {
    return !conversations.some((conv) =>
      !conv.isGroup && (conv.otherUser?.uid === u.uid || conv.otherUser?._id === u._id)
    );
  });

  // Filter based on search
  const filteredConversations = conversations.filter((conv) => {
    if (conv.isGroup) {
      return conv.groupName?.toLowerCase().includes(searchTerm.toLowerCase());
    }
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

  const handleUserClick = (selectedUser) => {
    navigate(`/home/messages/${selectedUser.uid || selectedUser._id}`);
    setSearchTerm("");
  };

  const handleConversationClick = (conversation) => {
    if (conversation.isGroup) {
      navigate(`/home/messages/c/${conversation._id}`);
    } else {
      const otherUser = conversation.otherUser;
      if (otherUser) {
        navigate(`/home/messages/${otherUser.uid || otherUser._id}`);
      }
    }
  };

  const handleDeleteClick = (e, conversation) => {
    e.stopPropagation();
    if (conversation.isGroup) {
      if (conversation.groupAdmin === user?.uid) {
        setConfirmAction({ type: 'delete', payload: conversation });
      } else {
        setConfirmAction({ type: 'leave', payload: conversation });
      }
    } else {
      setConfirmAction({ type: 'delete', payload: conversation });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      const targetId = confirmAction.payload._id;

      if (confirmAction.type === 'leave') {
        await leaveGroup(targetId);
      } else if (confirmAction.type === 'delete') {
        await deleteConversation(targetId);
      }

      if (selectedConversation?._id === targetId) {
        navigate('/home/messages');
      }

    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 border-l border-gray-100 dark:border-slate-900">

      <SidebarHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsGroupModalOpen={setIsGroupModalOpen}
      />

      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {isLoading && conversations.length === 0 ? (
          <ChatSidebarLoader />
        ) : (
          <>
            {/* Existing Conversations */}
            {filteredConversations.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">Recent Chats</h3>
                {filteredConversations.map((conversation) => (
                  <SidebarConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    selectedConversation={selectedConversation}
                    onlineUsers={onlineUsers}
                    user={user}
                    onClick={handleConversationClick}
                    onDeleteClick={handleDeleteClick}
                    onInfoClick={setInfoModalConversation}
                  />
                ))}
              </div>
            )}

            {/* Users Without Conversations */}
            {filteredUsersWithoutConv.length > 0 && (
              <div className="space-y-1 mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">Suggested People</h3>
                {filteredUsersWithoutConv.map((availableUser) => (
                  <SidebarUserItem
                    key={availableUser._id || availableUser.uid}
                    user={availableUser}
                    onClick={handleUserClick}
                  />
                ))}
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

      <SidebarModals
        isGroupModalOpen={isGroupModalOpen}
        setIsGroupModalOpen={setIsGroupModalOpen}
        confirmAction={confirmAction}
        setConfirmAction={setConfirmAction}
        handleConfirmAction={handleConfirmAction}
        infoModalConversation={infoModalConversation}
        setInfoModalConversation={setInfoModalConversation}
      />
    </div >
  );
};

export default ChatSidebar;
