import React from "react";
import PublicPosts from "./PublicPosts";
import RightSidebar from "../../../components/sidebar/RightSidebar";

const ProposalPostsBase = () => {
  return (
    <div className="flex h-full"> 
      {/* Posts Section */}
      <div className="flex-1 border-r border-gray-100 dark:border-slate-900 overflow-y-auto rn-scrollbar pr-2">
        <PublicPosts />
      </div>

      {/* Right Sidebar */}
      <div className="md:w-[330px] hidden lg:block shrink-0 overflow-y-auto rn-scrollbar pl-2">
        <RightSidebar />
      </div>
    </div>
  );
};

export default ProposalPostsBase;
