import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import Navbar from "../components/nav/Navbar";
import LeftSidebar from "../components/sidebar/LeftSidebar";
import useChatStore from "../store/useChatStore";
import useAuth from "../hooks/useAuth";

const Home = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { socket } = useAuth();
  const { subscribeToSocket, unsubscribeFromSocket } = useChatStore();

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

      <div className="flex justify-center h-[calc(100vh-80px)] overflow-hidden">
        <div className="flex w-full lg:mx-3">

          <div
            className={`
              shrink-0 transition-all duration-300
              ${isCollapsed ? "w-[70px]" : "md:w-[250px] w-[220px]"}
            `}
          >
            <LeftSidebar
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </div>

          <div className="flex-1 p-1  overflow-y-auto">
            <Outlet />
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;
