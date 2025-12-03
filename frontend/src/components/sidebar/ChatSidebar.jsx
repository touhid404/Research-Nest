import React from "react";
import { useDummyChats } from "../../hooks/useDummyChats";

const ChatSidebar = () => {
  const chats = useDummyChats(15);

  return (
    <div className="p-2 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Messages</h2>

      <div className="flex flex-col gap-3 rn-scrollbar">
        {chats.map(chat => (
          <div
            key={chat.id}
            className="flex items-center gap-3 p-3 rounded-xl 
                       hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-12 h-12 rounded-full"
              />
              {chat.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
              )}
            </div>

            {/* Name + Message */}
            <div className="flex flex-col">
              <span className="font-semibold">{chat.name}</span>
              <span className="text-sm text-gray-500 truncate max-w-[150px]">
                {chat.lastMessage}
              </span>
            </div>

            {/* Date */}
            <span className="ml-auto text-xs text-gray-500">
              {chat.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
