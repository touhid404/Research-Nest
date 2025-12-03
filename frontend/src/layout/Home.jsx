import { Outlet, useLocation } from "react-router";
import Navbar from "../components/nav/Navbar";

import LeftSidebar from "../components/sidebar/LeftSidebar";
import ChatSidebar from "../components/sidebar/ChatSidebar";
import ProfileSidebar from "../components/sidebar/ProfileSidebar";
import Trendingbar from "../components/sidebar/Trendingbar";

import { useEffect, useState } from "react";
const EmptySidebar = () => null;

const Home = () => {
  const location = useLocation();

  const [RightSidebarComponent, setRightSidebarComponent] = useState(
    () => Trendingbar
  );

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/home/messages")) {
      setRightSidebarComponent(() => ChatSidebar);
    } else if (path.startsWith("/home/my-profile")) {
      setRightSidebarComponent(() => ProfileSidebar);
    } else if (path.startsWith("/home/workspace")) {
      setRightSidebarComponent(() => EmptySidebar);
    } else {
      setRightSidebarComponent(() => Trendingbar); // default
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex justify-center h-[calc(100vh-80px)] overflow-hidden">
        <div className="flex w-full max-w-[1300px]">
          {/* Left Sidebar */}
          <div className="md:w-[280px] shrink-0 relative">
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-[650px] overflow-y-auto border-r border-gray-200 dark:border-gray-800 rn-scrollbar">
            <Outlet />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-[360px] shrink-0 p-2 overflow-y-auto text-gray-900 dark:text-gray-100">
            <RightSidebarComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
