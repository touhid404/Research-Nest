import { Outlet } from "react-router";
import LeftSidebar from "../components/sidebar/LeftSidebar";
import RightSidebar from "../components/sidebar/RightSidebar";
import Navbar from "../components/nav/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Main Layout */}
      <div className="flex justify-center h-[calc(100vh-20px)] overflow-hidden">
        <div className="flex w-full max-w-[1300px]">
          
          {/* Left Sidebar */}
          <div className="md:w-[280px] shrink-0 relative">
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-[650px] overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <Outlet />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-[370px] shrink-0 pl-8 overflow-y-auto text-gray-900 dark:text-gray-100">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
