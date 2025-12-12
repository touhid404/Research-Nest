import { Outlet, useLocation } from "react-router";
import { useState, useEffect } from "react";
import Navbar from "../components/nav/Navbar";
import LeftSidebar from "../components/sidebar/LeftSidebar";
import MobileBottomNav from "../components/nav/MobileBottomNav";
import useChatStore from "../store/useChatStore";
import useAuth from "../hooks/useAuth";

const Home = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { socket } = useAuth();
  const { subscribeToSocket, unsubscribeFromSocket } = useChatStore();
  const location = useLocation();
  const isMessagesPage = location.pathname.includes("/messages");

  useEffect(() => {
    if (socket) {
      subscribeToSocket(socket);
    }
    return () => {
      unsubscribeFromSocket();
    };
  }, [socket, subscribeToSocket, unsubscribeFromSocket]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">

      <Navbar />

      <div className="flex justify-center md:h-[calc(100vh-80px)] overflow-hidden">
        <div className="flex w-full lg:mx-3">

          {/* Left Sidebar - Hidden on mobile, visible on medium+ screens */}
          <div
            className={`
              hidden md:block
              shrink-0 transition-all duration-300
              ${isCollapsed ? "w-[70px]" : "w-[250px]"}
            `}
          >
            <LeftSidebar
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </div>

          {/* Mobile Bottom Navigation - Visible only on mobile */}
          <MobileBottomNav />

          {/* Main Content Area */}
          <div
            className={`
              flex-1 p-1 
              ${isMessagesPage ? 'overflow-hidden h-[calc(100vh-20px)] md:h-full' : 'overflow-y-auto'}
              pb-20 md:pb-1
            `}
          >
            <Outlet />
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;
