import React, { useEffect } from "react";
import ChatSidebar from "../../../components/sidebar/ChatSidebar";
import ChatInterface from "../../../components/chat/ChatInterface";
import { useParams } from "react-router";
import useChatStore from "../../../store/useChatStore";

const MessagesBase = () => {
  /* import useChatStore */
  const { uid } = useParams();
  const { selectedConversation, getOrCreateConversation, clearSelectedConversation } = useChatStore();

  useEffect(() => {
    if (uid) {
      getOrCreateConversation(uid);
    } else {
      clearSelectedConversation();
    }
  }, [uid, getOrCreateConversation, clearSelectedConversation]);

  return (
    <div className="h-full w-full flex overflow-hidden relative isolate">
      

      {/* Chat Interface - Hidden on mobile if no conversation selected */}
      <div className={`flex-1 h-full  min-w-0 bg-transparent ${!selectedConversation ? "hidden md:block" : "block"}`}>
        <ChatInterface />
      </div>

      {/* Sidebar - Hidden on mobile if conversation IS selected */}
      <div className={`shrink-0 h-full ${selectedConversation ? "hidden md:block" : "w-full"} md:w-[450px]`}>
        <ChatSidebar />
      </div>
    </div>
  );
};

export default MessagesBase;
