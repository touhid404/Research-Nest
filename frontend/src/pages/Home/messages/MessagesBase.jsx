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
    <div className="h-full w-full bg-slate-100 dark:bg-slate-950 flex overflow-hidden relative isolate">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-400/20 dark:bg-violet-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-400/20 dark:bg-fuchsia-900/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[30%] w-[30%] h-[30%] bg-cyan-400/20 dark:bg-cyan-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Chat Interface - Hidden on mobile if no conversation selected */}
      <div className={`flex-1 h-full min-w-0 bg-transparent ${!selectedConversation ? "hidden md:block" : "block"}`}>
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
