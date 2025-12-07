import React from "react";
import RightSidebar from "../../../components/sidebar/RightSidebar";
import PendingRq from './PendingRq';

const RequestBase = () => {
  return (
    <div className="flex h-full"> 
      {/* Posts Section */}
      <div className="flex-1 border-r border-gray-100 dark:border-gray-800 overflow-y-auto rn-scrollbar pr-2">
      <PendingRq/>
      </div>

      {/* Right Sidebar */}
      <div className="md:w-[330px] hidden lg:block shrink-0 overflow-y-auto rn-scrollbar pl-2">
        <RightSidebar />
      </div>
    </div>
  );
};

export default RequestBase;
