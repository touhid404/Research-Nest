import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";

import Navbar from "../components/nav/Navbar";
import LeftSidebar from "../components/sidebar/LeftSidebar";
import Trendingbar from "../components/sidebar/Trendingbar";
import ChatSidebar from "../components/sidebar/ChatSidebar";
import ProfileSidebar from "../components/sidebar/ProfileSidebar";
import { cn } from "../utils/cn";
const Home = () => {
  const [RightSidebar, setRightSidebar] = useState(() => Trendingbar);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/home/messages") {
      setRightSidebar(() => ChatSidebar);
    } else if (location.pathname === "/home/my-profile") {
      setRightSidebar(() => ProfileSidebar);
    } else {
      setRightSidebar(() => Trendingbar);
    }
  }, [location.pathname]);

  return (
    <div className={cn("flex h-full flex-col items-center")}>
      <Navbar className="sticky top-0" />
      <div className="flex w-full flex-1 max-sm:flex-col sm:max-w-7xl">
        <LeftSidebar
          className={cn(
            "sticky bottom-0 h-16 shrink-0",
            "sm:top-15 sm:h-[calc(100dvh-60px)] sm:w-16 sm:border-r-1 lg:w-1/5",
            "max-sm:items-center max-sm:justify-center",
          )}
        />
        <div
          className={cn(
            "overflow-hidden py-2 sm:flex-1 sm:py-3",
            "rn-scrollbar",
          )}
        >
          <Outlet />
        </div>
        <RightSidebar
          className={cn(
            "border-popover sticky top-15 h-[calc(100vh-60px)] shrink-0 overflow-y-auto border-l-1",
            "rn-scrollbar w-[23%]",
            "transition-all max-md:hidden",
          )}
        />
      </div>
    </div>
  );
};

export default Home;
