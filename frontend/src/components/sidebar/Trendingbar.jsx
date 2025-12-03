import React from "react";
import { FaFireAlt } from "react-icons/fa";

const Trendingbar = () => {
  const trends = [
    { topic: "AI Collaboration Tools", posts: 120 },
    { topic: "Research Proposal Drafting", posts: 98 },
    { topic: "Funding Opportunities 2025", posts: 76 },
    { topic: "Machine Learning Projects", posts: 64 },
    { topic: "Academic Paper Reviews", posts: 52 },
    { topic: "Team Formation Requests", posts: 40 },
    { topic: "Team Formation Requests", posts: 40 },
    { topic: "Team Formation Requests", posts: 40 },
    { topic: "Team Formation Requests", posts: 40 },
    { topic: "Team Formation Requests", posts: 40 },
  ];

  return (
    <div className="p-4 shadow rounded-xl">
      <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
        <FaFireAlt className="text-red-500" />
        Trending on ResearchNest
      </h2>

      <div className="space-y-3">
        {trends.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-500 cursor-pointer transition"
          >
            <span className="font-medium">{item.topic}</span>
            <span className="text-sm text-gray-500">{item.posts} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trendingbar;
