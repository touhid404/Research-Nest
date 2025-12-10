import MessageHome from "./MessageHome";
import ChatSidebar from '../../../components/sidebar/ChatSidebar';

const MessagesBase = () => {
  return (
    <div className="flex h-full"> 
      {/* Posts Section */}
      <div className="flex-1 border-r border-gray-100 dark:border-gray-800 overflow-y-auto rn-scrollbar pr-2">
        <MessageHome/>
      </div>

      {/* Right Sidebar */}
      <div className="md:w-[450px] hidden lg:block shrink-0 overflow-y-auto rn-scrollbar pl-2">
        <ChatSidebar/>
      </div>
    </div>
  );
};

export default MessagesBase;
